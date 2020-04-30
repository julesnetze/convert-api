const express = require('express');

const convertController = require('../controllers/convert');

const router = express.Router();

router.get('/:amount/:srcCurrency/:destCurrency/:referenceDate', convertController.convert);

module.exports = router;
