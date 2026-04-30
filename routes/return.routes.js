const express = require("express")
const router = express.Router()

const upload = require('../middlewares/upload')
const returnController = require('../controller/return.controller')

router.post('/', upload.none(), returnController.createReturn)

module.exports = router