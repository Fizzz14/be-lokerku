const express = require('express')
const router = express.Router()

const loanController = require('../controller/loan.controller')
const upload = require('../middlewares/upload')

router.post('/', upload.none(), loanController.createLoan)
router.get('/', loanController.getLoan)

module.exports = router