const express = require('express');
const { getLocations, getLocationById } = require('../controller/locationController');

const router = express.Router();

router.get('/', getLocations);
router.get('/:id', getLocationById);

module.exports = router;
