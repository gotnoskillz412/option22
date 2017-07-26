'use strict';

const express = require('express');

const router = express.Router();

// Health check
router.get('/', function (req, res) {
	res.status(200).send('ok');
});

exports = module.exports = router;