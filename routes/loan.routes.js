const express = require('express')
const router = express.Router()

const loanController = require('../controller/loan.controller')
const returnController = require('../controller/return.controller')
const upload = require('../middlewares/upload')

router.post('/', upload.none(), loanController.createLoan)
router.get('/:id/return', returnController.createReturn)

module.exports = router