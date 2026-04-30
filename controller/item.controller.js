const Validator = require("fastest-validator");
const v = new Validator();
const { response } = require("../helpers/response.formatter");
const { Item, Loan } = require("../models");
const { Op } = require("sequelize");
const fs = require('fs');
const path = require('path');

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
            return res.status(500).json(response(500, 'server error', error.message));
        }
    },

    getItem : async (req, res) => {
        try {
            // req.body : mengambil payload body postman / input post
            // req.query : mengambil payload query params ?search=
            const { name, sortBy, order } = req.query;

            // jika name query params ada, cari berdasarkan field name dengan operator like, jika tidak ada query params tidak mencari perdasarkan field apapun
            const items = await Item.findAll({
                where: name ? {
                    name: {
                        [Op.like]: `%${name}%`
                    } 
                } : {},
                order: sortBy ? [
                    [sortBy, order]
                ] : []
            });
            return res.status(200).json(response(200, 'success', items));
        } catch (error) {
            return res.status(500).json(response(500, 'server error', error.message));
        }
    },

    showItem : async (req, res) => {
        try {
            // req.params untuk mengambil parameter routes, pada route bagian yang ada titik dua (:)
            const { id } = req.params;

            const item = await Item.findByPk(id);
            return res.status(200).json(response(200, 'success', item));
        } catch (error) {
            return res.status(500).json(response(500, 'server error', error.message));
        }
    },

    updateItem : async (req, res) => {
        try {
            const { id } = req.params;
            const { name, stock } = req.body;

            // validasi data
            const schema = {
                name: { type: "string", min: 3 },
                stock: { type: "number", positive: true, integer: true },
            }
            const data = {
                name: name,
                stock: Number(stock) 
            }
            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, 'error validasi', validate));
            }

            // ambil data sebelumnya
            const item = await Item.findByPk(id);
            // jika data tidak ada kembalikan error
            if (!item) {
                return res.status(404).json(response(404, 'data not found'));
            }
            // jika ada, bandingkan stock. stock yang diupdate tidak boleh lebih kecil dari stock saat ini
            if (Number(stock) < Number(item.stock)) {
                return res.status(400).json(response(400, 'The updated stock is less than the actual stock.'));
            }

            // jika pada req terdapat file
            if (req.file) {
                // karena sebelumnya di model item, image sudah diberi get sehingga menghasilkan url/nama file jd gunakan getDataValue untuk mengambil nilai asli image dari database
                const rawImageName = item.getDataValue('image');
                // ambil lokasi gambar sebelumnya
                const oldFilePath = path.join(process.cwd(), 'uploads', rawImageName);
                // jika ada file tersebut hapus
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath); // Menghapus file lama
                }
            }
            const updateProcess = await Item.update({
                name: name,
                stock: stock,
                image: (req.file ? req.file.filename : item.image)
            }, {
                where: {id: id}
            });
            // jika ingin mengembalikan data terbaru, perlu diambil ulang. karena hasil dari updateProcess antara 1 (berhasil)/0 (gagal) 
            const itemUpdated = await Item.findByPk(id);
            return res.status(200).json(response(200, 'updated', itemUpdated));
        } catch (error) {
            return res.status(500).json(response(500, 'server error', error.message));
        }
    },

    deleteItem : async (req, res) => {
        try {
            const { id } = req.params;
            // include : mengambil relasi melalui model, pastikan sudah didaftarkan di model terkait
            const item = await Item.findByPk(id, { include : Loan });
            // relasi bertipe hasMany, jika ksoong berupa [] = length 0
            if (item.Loans.length == 0) {
                // hapus gambar
                const rawImageName = item.getDataValue('image');
                const oldFilePath = path.join(process.cwd(), 'uploads', rawImageName);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath); 
                }
                // hapus data jika tidak ada relasi
                const deleteProcess = await Item.destroy({
                    where: {id: id}
                });
                return res.status(200).json(response(200, 'deleted'));
            } else {
                return res.status(400).json(response(400, 'Item is already related to a loan'));
            }
        } catch (error) {
            return res.status(500).json(response(500, 'server error', error.message));
        }
    }
}
