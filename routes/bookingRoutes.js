const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { createBooking, getMyBookings } = require('../controller/bookingController');

const router = express.Router();

router.post('/', authMiddleware, upload.none(), createBooking);
router.get('/me', authMiddleware, getMyBookings);

module.exports = router;
