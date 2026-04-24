const Validator = require("fastest-validator");
const v = new Validator();
const { response } = require("../helpers/response.formatter");
const { Item } = require("../models");

module.exports = {
    // method 
    // public function createItem($request) { ... }
    createItem : async (req, res) => {
        try {
            // ambil data, file adanya di req.file jadi tidak disertakan disini
            const { name, stock } = req.body;

            // schema validasi data
            const schema = {
                name: { type: "string", min: 3 },
                stock: { type: "number", positive: true, integer: true },
            }

            // menyiapkan sumber data
            const data = {
                name: name,
                stock: Number(stock) //karena hasil dari req.body berupa string, ubah menjadi number
            }

            // cek validasi
            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, 'error validasi', validate));
            }
            // validasi untuk file, jika tidak ada beri error
            if (!req.file) {
                return res.status(400).json(response(400, 'gambar tidak boleh kosong'));
            }

            // proses create data
            const item = await Item.create({
                name: data.name,
                stock: data.stock,
                image: req.file.filename
            });
            return res.status(201).json(response(201, 'created', item));
        } catch (error) {
            return res.status(500).json(response(400, 'server error', error));
        }
    }
}