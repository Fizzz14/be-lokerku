const Validator = require("fastest-validator");
const v = new Validator();
const { response } = require("../helpers/response.formatter");
const { Item, Loan, Return } = require("../models");
const { Op } = require("sequelize");

module.exports = {
    createLoan: async (req, res) => {
        try {
            const { item_id, name, total_item, date } = req.body;
            // validasi
            const schema = {
                name: { type: "string", min: 3 },
                total_item: { type: "number", positive: true, integer: true },
                date: { type: "date" },
                item_id: { type: "number", positive: true }
            }
            const data = {
                name: name,
                total_item: Number(total_item),
                date: new Date(date),
                item_id: Number(item_id),
            }
            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, 'error validasi', validate));
            }
            // cek jika item_id tidak tersedia datanya pada item
            const item = await Item.findByPk(item_id);
            if (!item) {
                return res.status(400).json(response(400, 'Item not found'));
            }
            // cek jika total_item dipinjam lebih dari stock yg tersedia
            if (item && item.stock < data.total_item) {
                return res.status(400).json(response(400, 'Stock unavailable'));
            }

            const createProcess = await Loan.create(data);
            // kurangi stok di item
            const updateItem = await Item.update({
                stock: item.stock - createProcess.total_item
            }, {
                where: {id: item_id}
            });
            // ambil data loan dan relasi item nya
            const loan = await Loan.findByPk(createProcess.id, { include: Item });
            return res.status(201).json(response(201, 'created', loan));
        } catch (error) {
            return res.status(500).json(response(500, 'server error', error.message));
        }
    },

    getLoan: async (req, res) => {
        try {
            // jika tidak ada query params page, isi sebagai angka 1 pagenya
            // tidak menggunakan desturct { } karena dipanggil langsung di kanan .page dan .limit
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 5;
            // rumus mengambil data pagination : offset = (page - 1) * limit
            // offset : mengambil data mulai dari angka yg ditentukan. misal offset 10 artinya mengambil data mulai dari baris ke 11
            // limit : maksimal data yang dimunculkan
            // (1-1) * 5 = 0 * 5 = 0, offset 0 artinya page 1 data dimulai dari baris ke 1 sampai 5 (limit)
            // (2-1) * 5 = 1 * 5 = 5, offset 5 artinya page 2 data dimulai dari baris ke 6 sampai 10 (limit)
            const offset = (page - 1) * limit;

            const { count, rows } = await Loan.findAndCountAll({ offset: offset, limit: limit, include: [Item, Return] });
            const formatPagination = {
                data: rows, // detail data
                limit: limit, // limit per page
                rangeData: (offset+1) + "-" + (offset+rows.length), // baris data yg dimunculkan
                currentPage: page, // posisi page pagination
                totalPage: Math.round(count / limit), // jumlah halaman pagination
                total: count // jumlah seluruh data
            }
            return res.status(200).json(response(200, 'success', formatPagination));
        } catch (error) {
            return res.status(500).json(response(500, 'server error', error.message));
        }
    }
}
