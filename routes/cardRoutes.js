const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getCardByTransactionId } = require('../controller/cardController');

const router = express.Router();

router.get('/:transactionId', authMiddleware, getCardByTransactionId);

module.exports = router;
