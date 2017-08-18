'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');

const accountExtractor = require('../middleware/accountExtractor');
const cache = require('../utilities/cache');
const constants = require('../helpers/constants');
const crypto = require('../services/crypto');
const logger = require('../utilities/logger');
const mongoHelpers = require('../helpers/mongoHelpers');
const security = require('../middleware/security');

const router = express.Router();

const passwordRegex = new RegExp('(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$');
const usernameRegex = new RegExp('^([a-zA-Z0-9_]{5,50})$');

// Registration endpoint for new accounts and profiles
router.post('/register', function (req, res) {
    let firstName = req.body.firstName || null;
    let lastName = req.body.lastName || null;
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
                let password = req.body.password;
                if (!password.match(passwordRegex)) {
                    return Promise.reject({
                        step: constants.mongo.steps.accountCreate,
                        message: 'Password did not meet requirements.'
                    });
                } else if (!username.match(usernameRegex)) {
                    return Promise.reject({
                        step: constants.mongo.steps.accountCreate,
                        message: 'Username must be alphanumeric and between 5 and 50 characters.'
                    });
                }

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
            return mongoHelpers.createProfile({ accountId: act._id, firstName: firstName, lastName: lastName });
        })
        .then((profile) => {
            let token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + 3600,
                data: {
                    username: username,
                    email: email
                }
            }, process.env.MY_SECRET);
            res.status(201).json({
                token: token,
                profile: profile,
                account: { email: account.email, username: account.username, _id: account._id }
            });
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
            if (!(act && crypto.verifyPassword(password, act.salt, act.hash))) {
                res.status(401).json({ message: 'Incorrect username or password' });
            } else {
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
                    res.status(201).json({
                        token: token,
                        profile: profile,
                        account: { email: account.email, username: account.username, _id: account._id }
                    });
                });
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

// Get Account Info for logged in users
router.get('/account', security(), (req, res) => {
    mongoHelpers.findAccount({ username: req.decoded.data.username })
        .then((act) => {
            if (!act) {
                res.status(500).json({ message: 'Failed to find account' });
            } else {
                mongoHelpers.findProfile({ accountId: act._id })
                    .then((profile) => {
                        if (!profile) {
                            res.status(500).json({ message: 'Failed to find profile' });
                        } else {
                            res.status(200).json({
                                account: { email: act.email, username: act.username, _id: act._id },
                                profile: profile
                            });
                        }
                    })
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

//Update the account password
router.put('/account/:accountId/password', security(), accountExtractor(), (req, res) => {
    let newPassword = req.body.newPassword;
    let currentPassword = req.body.currentPassword;
    if (!(req.account && crypto.verifyPassword(currentPassword, req.account.salt, req.account.hash))) {
        res.status(400).json({ message: 'Incorrect password' });
    } else {
        let creds = crypto.generateSaltAndHash(newPassword);
        req.account.salt = creds.salt;
        req.account.hash = creds.hash;

        let token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + 3600,
            data: {
                username: req.account.username,
                email: req.account.email
            }
        }, process.env.MY_SECRET);

        req.account.save((err, account) => {
            if (err) {
                logger.error('auth', 'Failed to update password', { error: err });
                res.status(500).json({message: 'Failed to update password.'});
            } else {
                res.status(200).json({
                    token: token,
                    account: {
                        username: account.username,
                        email: account.email,
                        _id: account._id
                    }
                });
            }
        });
    }
});

//Update the account username and password
router.put('/account/:accountId/update', security(), accountExtractor(), (req, res) => {
    let username = req.body.username;
    let email = req.body.email;
    if (!username.match(usernameRegex)) {
        res.status(400).json({message: 'Username must be alphanumeric and between 5 and 50 characters.'})
    } else {
        req.account.email = email;
        req.account.username = username;
        req.account.save((err, account) => {
            if (err) {
                logger.error('auth', 'Failed to update password', { error: err });
                res.status(500).json({message: 'Failed to update password.'});
            } else {
                let token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + 3600,
                    data: {
                        username: account.username,
                        email: account.email
                    }
                }, process.env.MY_SECRET);
                res.status(200).json({
                    token: token,
                    account: {
                        username: account.username,
                        email: account.email,
                        _id: account._id
                    }
                });
            }
        });
    }

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