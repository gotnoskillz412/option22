'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');

const cache = require('../utilities/cache');
const constants = require('../helpers/constants');
const crypto = require('../services/crypto');
const logger = require('../utilities/logger');
const mongoHelpers = require('../helpers/mongoHelpers');
const security = require('../middleware/security');

const router = express.Router();

// Registration endpoint for new accounts and profiles
router.post('/register', function (req, res) {
    // TODO check to make sure that the username and email are valid formats
    let username = req.body.username.toLowerCase();
    let email = req.body.email.toLowerCase();
    let account = null;

    // first check for if a user exists already
    mongoHelpers.findAccount({ email: email })
        .then((account) => {
            if (!account) {
                return mongoHelpers.findAccount({ username: username })
            }
            return Promise.reject({
                step: constants.mongo.steps.accountCreate,
                message: 'Account with that email already exists.',
                error: null
            });
        })
        .then((account) => {
            if (!account) {
                // TODO Check to make sure password meets constraints
                let password = req.body.password;

                let creds = crypto.generateSaltAndHash(password);

                return mongoHelpers.createAccount({
                    username: username,
                    email: email,
                    salt: creds.salt,
                    hash: creds.hash
                });
            }
            return Promise.reject({
                step: constants.mongo.steps.accountCreate,
                message: 'Account with that username already exists.',
                error: null
            });
        })
        .then((act) => {
            account = act;
            return mongoHelpers.createProfile({ accountId: act._id });
        })
        .then((profile) => {
            let token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + 3600,
                data: {
                    username: username,
                    email: email
                }
            }, process.env.MY_SECRET);
            res.status(201).json({ token: token, profile: profile, account: account });
        })
        .catch((err) => {
            if (err.step === constants.mongo.steps.profileCreate) {
                mongoHelpers.removeAccount({ email: email }).then(() => {
                    res.status(500).json({ message: err.message })
                });
            } else if (!err.error) {
                res.status(400).json({ message: err.message });
            } else {
                logger.error('auth', err.message, { error: err.error, step: err.step });
                res.status(500).json({ message: err.message });
            }
        });
});

// Login endpoint
router.post('/login', (req, res) => {
    // Check credentials and then provide token
    let username = req.body.username && req.body.username.toLowerCase();
    let password = req.body.password;
    let account = null;
    mongoHelpers.findAccount({ username: username })
        .then((act) => {
            if (act && crypto.verifyPassword(password, act.salt, act.hash)) {
                account = act;
                mongoHelpers.findProfile({ accountId: account._id }).then((profile) => {
                    let token = jwt.sign({
                        exp: Math.floor(Date.now() / 1000) + 3600,
                        data: {
                            username: username,
                            email: account.email
                        }
                    }, process.env.MY_SECRET);
                    logger.verbose('auth', 'Login successful', { email: account.email });
                    res.status(201).json({ token: token, profile: profile, account: account });
                });
            } else {
                res.status(401).json({ message: 'Incorrect username or password' });
            }
        })
        .catch((err) => {
            if (!err.error) {
                res.status(400).json({ message: err.message });
            } else {
                logger.error('auth', err.message, { error: err.error, step: err.step });
                res.status(500).json({ message: err.message });
            }
        });
});

// Logout endpoint
router.get('/logout', security(), function (req, res) {
    let token = req.headers.authorization && req.headers.authorization.split(' ');
    token = token && token.length === 2 && token[0].toLowerCase() === 'bearer' ? token[1] : null;
    cache.set(constants.blacklistPrefix + token, true, (err, response) => {
        if (err) {
            logger.error('auth', 'Failed to logout', { error: err });
            req.status(500).json({ message: 'Failed to log out' });
        }
        if (response) {
            setTimeout(() => {
                cache.del(constants.blacklistPrefix + token);
            }, 3600000);
        }
        if (req.query.redirect_uri) {
            res.redirect(302, req.query.redirect_uri);
        } else {
            res.status(200).json({ ok: true });
        }
    });
});

exports = module.exports = router;