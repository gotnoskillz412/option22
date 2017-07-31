'use strict';

const express = require('express');

const router = express.Router();

// Health check
router.get('/', function (req, res) {
    res.status(200).json({ ok: true });
});

exports = module.exports = router;