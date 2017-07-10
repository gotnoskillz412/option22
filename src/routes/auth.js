'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const logger = require('winston');

const cache = require('../services/cache');
const constants = require('../helpers/constants');
const crypto = require('../services/crypto');
const mongoHelpers = require('../helpers/mongoHelpers');
const security = require('../middleware/security');

const router = express.Router();

/**
 * Registration Endpoint
 * @memberOf auth
 * @function
 * @name register
 */
router.post('/register', function (req, res) {
    // TODO check to make sure that the username and email are valid
    let username = req.body.username.toLowerCase();
    let email = req.body.email.toLowerCase();

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
        .then(() => {
            return mongoHelpers.createProfile({ email: email });
        })
        .then(() => {
            let token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + 3600,
                data: username
            }, process.env.MY_SECRET);
            res.status(201).json({ token: token });
        })
        .catch((err) => {
            if (err.step === constants.mongo.steps.profileCreate) {
                mongoHelpers.removeAccount({ email: email }).then(() => {
                    res.status(500).json({ message: err.message })
                });
            } else if (!err.error) {
                res.status(400).json({ message: err.message });
            } else {
                logger.error(err.step, err.message, err.error);
                res.status(500).json({ message: err.message });
            }
        });
});

router.post('/login', (req, res) => {
    // Check credentials and then provide token
    let username = req.body.username && req.body.username.toLowerCase();
    let password = req.body.password;
    mongoHelpers.findAccount({username: username})
        .then((account) => {
            if (!!account && crypto.verifyPassword(password, account.salt, account.hash)) {
                let token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + 3600,
                    data: account.username
                }, process.env.MY_SECRET);
                logger.info('login success');
                res.status(201).json({ token: token });
            } else {
                res.status(401).json({ message: 'Incorrect username or password' });
            }
        })
        .catch((err) => {
            if (!err.error) {
                res.status(400).json({ message: err.message });
            } else {
                logger.error(err.step, err.message, err.error);
                res.status(500).json({ message: err.message });
            }
        });
});

router.get('/logout', security(), function (req, res) {
    let token = req.headers.authorization && req.headers.authorization.split(' ');
    token = token && token.length === 2 && token[0].toLowerCase() === 'bearer' ? token[1] : null;
    cache.set(constants.blacklistPrefix + token, true, (err, response) => {
        if (response) {
            setTimeout(() => {
                cache.del(constants.blacklistPrefix + token);
            }, 3600000);
        }
        if (req.query.redirect_uri) {
            res.redirect(req.query.redirect_uri, {});
        } else {
            res.status(200).send('ok');
        }
    });
});

exports = module.exports = router;