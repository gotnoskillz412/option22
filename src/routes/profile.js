'use strict';

const express = require('express');

const logger = require('../services/logger');
const mongoHelpers = require('../helpers/mongoHelpers');

const router = new express.Router();

// Get to retrieve profile information
router.get('/', function (req, res) {
    mongoHelpers.findProfile({ username: req.decoded.data.username, email: req.decoded.data.email })
        .then((profile) => {
            const profileInfo = {
                profile: profile
            };
            res.status(200).json(profileInfo);
        }).catch(() => {
        res.status(500).json({ message: 'Could not find profile' });
    });
});

// Put to update profile information
router.put('/', function () {
    // TODO have users update their profile information here
});

// Post to add/update a profile picture
router.post('/picture', function (req, res) {
    // TODO verify image type is a base64 string
    mongoHelpers.findProfile({ username: req.decoded.data.username, email: req.decoded.data.email })
        .then((profile) => {
            profile.picture = req.body.image;
            profile.save((err) => {
                if (err) {
                    logger.error('profile', 'Error saving the profile picture', { error: err });
                    res.status(500).json({ message: 'Error uploading file' });
                } else {
                    logger.verbose('profile', 'Picture saved successfully to account', { email: profile.email });
                    res.status(200).send('success');
                }
            });
        })
        .catch((err) => {
            logger.error('profile', 'Could not find profile', { error: err });
            res.status(500).json({ message: 'Could not find profile' });
        });
});

module = module.exports = router;