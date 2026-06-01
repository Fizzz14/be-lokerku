const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { updateMe, uploadPhoto } = require('../controller/userController');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.put('/me', authMiddleware, upload.none(), updateMe);
router.post('/photo', authMiddleware, upload.single('image'), uploadPhoto);

module.exports = router;
