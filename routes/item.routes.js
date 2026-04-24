const express = require('express')
// ini digunakan jika routing dibuat terpisah, bukan di definisikan langsung di app.js
const router = express.Router()

const itemController = require('../controller/item.controller')
const upload = require('../middlewares/upload')

// endpoint
// upload.single : multer, untuk mengirimkan data 1 file dari input name image
router.post('/', upload.single('image'), itemController.createItem)

module.exports = router