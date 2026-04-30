const Validator = require("fastest-validator");
const v = new Validator();
const { response } = require("../helpers/response.formatter");
const { Loan, Return, Item } = require("../models");
const { Op } = require("sequelize");

module.exports = {
    createReturn: async (req, res) => {
        try {
            const { loan_id, total_item, notes, date } = req.body;

            const schema = {
                loan_id: { type: "number", positive: true },
                total_item: { type: "number", positive: true, integer: true },
                date: { type: "date" }
            }

            const data = {
                loan_id: Number(loan_id),
                total_item: Number(total_item),
                notes: notes ?? '-',
                date: new Date(date),
            }
            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, 'error validasi', validate));
            }

            // jika id loan tidak ada
            const loan = await Loan.findByPk(loan_id, {include: Item});
            if (!loan) {
                return res.status(400).json(response(400, 'Loan not found'));
            }
            // jika stok barang yg kembali lebih maka error, jika kurang tidak masalah (ibarat barang rusak)
            if (loan && loan.total_item < data.total_item) {
                return res.status(400).json(response(400, 'Total item in loan ' + loan.total_item)); 
            }

            const createProcess = await Return.create(data);
            // update kembali stok di item
            const updateItem = await Item.update({ stock: (loan.Item.stock + createProcess.total_item) }, {
                where: { id: loan.item_id }
            });
            // kembalikan data loan terbaru, pastikan relasi return sudah terisi
            const loanUpdated = await Loan.findByPk(loan_id, {include: [Item, Return]});
            return res.status(201).json(response(201, 'created', loanUpdated));
        } catch (error) {
            return res.status(500).json(response(500, 'server error', error.message));
        }
    }
}