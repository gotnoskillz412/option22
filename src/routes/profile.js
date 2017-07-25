'use strict';

const express = require('express');
const router = new express.Router();

const fs = require('fs');

const mongoHelpers = require('../helpers/mongoHelpers');

router.get('/', function (req, res) {
    mongoHelpers.findProfile({ username: req.decoded.data.username, email: req.decoded.data.email })
        .then((profile) => {
            const profileInfo = {
                profile: profile
            };
            res.status(200).json(profileInfo);
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ message: 'Could not find profile' });
        });
});

router.post('/picture', function (req, res) {
    mongoHelpers.findProfile({ username: req.decoded.data.username, email: req.decoded.data.email })
        .then((profile) => {
            profile.picture = req.body.image;
            profile.save((err) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({message: 'Error uploading file'});
                } else {
                    res.status(200).send('success');
                }
            });
        }).catch((err) => {
        res.status(500).json({ message: 'Could not find profile' });
    });
});

router.put('/:accountId', function () {
    // TODO have users update their profile information here
});


module = module.exports = router;