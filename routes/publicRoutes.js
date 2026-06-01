const express = require('express');
const { getRegions, getLockerSizes } = require('../controller/publicController');

const router = express.Router();

router.get('/regions', getRegions);
router.get('/sizes', getLockerSizes);

module.exports = router;
