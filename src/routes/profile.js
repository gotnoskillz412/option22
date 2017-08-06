'use strict';

const express = require('express');
const mongoose = require('mongoose');

const logger = require('../utilities/logger');
const mongoHelpers = require('../helpers/mongoHelpers');

const router = new express.Router();

// Get to retrieve profiles in account
router.get('/', function (req, res) {
    mongoHelpers.findAllProfiles({ accountId: req.account._id })
        .then((profiles) => {
            res.status(200).json({total: profiles.length, data: profiles});
        })
        .catch((err) => {
            logger.error('profile', 'Error getting all profiles', {error: err});
            res.status(500).json({ message: 'Could not find profiles' });
        });
});

// Get to retrieve specific profile in account
router.get('/:profileId', function (req, res) {
    if (mongoose.Types.ObjectId.isValid(req.params.profileId)) {
        mongoHelpers.findProfile({ _id: req.params.profileId, accountId: req.account._id })
            .then((profile) => {
                if (!profile) {
                    res.status(404).send();
                } else {
                    res.status(200).json(profile);
                }
            })
            .catch((err) => {
                logger.error('profile', 'Error getting specified profile', { error: err });
                res.status(500).json({ message: 'Could not find profile' });
            });
    } else {
        res.status(404).send();
    }
});

// Put to update profile information
router.put('/:profileId', function (req, res) {
    let updatedProfile = req.body;
    mongoHelpers.findProfile({ _id: req.params.profileId })
        .then((profile) => {
            Object.keys(updatedProfile).forEach((key) => {
                if (profile[key] !== updatedProfile[key]) {
                    profile[key] = updatedProfile[key];
                }
            });
            profile.save((err, result) => {
                if (err) {
                    logger.error('profile', 'Error updating profile', { error: err });
                    res.status(500).json({ message: 'Error updating profile' });
                } else {
                    logger.verbose('profile', 'Profile updated successfully', { email: profile.email });
                    res.status(200).json(result);
                }
            });
        })
        .catch((err) => {
            logger.error('profile', 'Could not find profile', { error: err });
            res.status(500).json({ message: 'Could not find profile' });
        });
});

module = module.exports = router;