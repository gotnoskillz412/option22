'use strict';

const express = require('express');
const router = new express.Router();

router.get('/', function (req, res) {
    // TODO return all profile information, including profile picture
    res.status(200).send('success');
});

router.put('/:accountId', function () {
    // TODO have users update their profile information here
});


module = module.exports = router;