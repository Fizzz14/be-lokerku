const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { register, login, me } = require('../controller/authController');

const router = express.Router();

router.post('/register', upload.none(), register);
router.post('/login', upload.none(), login);
router.get('/me', authMiddleware, me);

module.exports = router;
