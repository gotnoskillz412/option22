'use strict';

const express = require('express');
const router = express.Router();
const logger = require('winston');
const jwt = require('jsonwebtoken');

const Account = require('../models/account.mongoose');
const crypto = require('../services/crypto');
const Profile = require('../models/profile.mongoose');
const security = require('../middleware/security');

/**
 * A wrapper around the mongoose findOne method in order to use promises.  Finds an account based on provided params.
 * @param params
 * @returns {Promise}
 */
const findAccount = (params) => {
    return new Promise(function (resolve, reject) {
        Account.findOne(params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

/**
 * A wrapper around the mongoose save method in order to use promises.  Creates an account based on provided params.
 * @param params
 * @returns {Promise}
 */
const createAccount = (params) => {
    return new Promise(function (resolve, reject) {
        let account = new Account(params);
        account.save((err, result) => {
            if (err) {
                reject(err);
            } else {
                logger.info(`Succressfull created acount for: ${params.email}`);
                resolve(result);
            }
        });
    });
};

/**
 * A wrapper around the mongoose remove method in order to use promises.  Removes an account based on provided params.
 * @param params
 * @returns {Promise}
 */
const removeAccount = (params) => {
    return new Promise(function (resolve, reject) {
        Account.remove(params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                logger.info(`Succressfull removed acount for: ${params.email}`);
                resolve(result);
            }
        });
    });
};

/**
 * A wrapper around the mongoose save method in order to use promises.  Creates a profile based on provided params.
 * @param params
 * @returns {Promise}
 */
const createProfile = (params) => {
    return new Promise(function (resolve, reject) {
        let profile = new Profile(params);
        profile.save((err, result) => {
            if (err) {
                reject(err);
            } else {
                logger.info(`Succressfull created profile for: ${params.email}`);
                resolve(result);
            }
        });
    });
};

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
    findAccount({ email: email })
        .then(() => {
            return findAccount({username: username})
        })
        .then(() => {
            // TODO Check to make sure password meets constraints
            let password = req.body.password;

            let creds = crypto.generateSaltAndHash(password);

            return createAccount({
                username: username,
                email: email,
                salt: creds.salt,
                hash: creds.hash
            });
        })
        .then(() => {
            return createProfile({email: email});
        })
        .catch((err) => {
            logger.error(err);
            res.status(500).json({ message: 'Error registering' });
        });


    Account.findOne({
        email: email
    }, (emailError, emailUser) => {
        if (emailError) {
            res.status(500).json({ message: 'Error registering' });
        } else if (!emailUser) {
            Account.findOne({
                username: username
            }, (usernameError, usernameUser) => {
                if (usernameError) {
                    res.status(500).json({ message: 'Error registering' });
                } else if (!usernameUser) {
                    // TODO Check to make sure password meets constraints
                    let password = req.body.password;

                    let creds = crypto.generateSaltAndHash(password);
                    let newAccount = new Account({
                        username: username,
                        email: email,
                        salt: creds.salt,
                        hash: creds.hash
                    });

                    newAccount.save((err) => {
                        if (err) {
                            logger.error(err);
                            res.status(500).json({ message: 'Problem creating new account' });
                        } else {
                            logger.info(`Succressfull created acount for: ${email}`);
                            let newProfile = new Profile({
                                email: email
                            });
                            newProfile.save((profileErr) => {
                                if (profileErr) {
                                    Account.remove({ email: email }, () => {
                                        res.status(500).json({ message: 'Problem creating new profile' });
                                    });
                                } else {
                                    logger.info(`Succressfull created profile for: ${email}`);
                                    let token = jwt.sign({
                                        exp: Math.floor(Date.now() / 1000) + 3600,
                                        data: username
                                    }, process.env.MY_SECRET);
                                    res.status(201).json({ token: token });
                                }
                            });
                        }
                    })
                } else {
                    res.status(400).json({ 'message': 'This username is already taken' });
                }
            });
        } else {
            // let them know email is taken
            res.status(400).json({ 'message': 'An account with this email already exists' });
        }
    });

    // later, verify email address
});

router.post('/login', (req, res) => {
    // Check credentials and then provide token
    let username = req.body.username && req.body.username.toLowerCase();
    let password = req.body.password;
    account.findOne({
        username: username
    }, (err, user) => {
        if (err) {
            //redirect with no user found error
            res.status(400).json({ message: 'Incorrect username or password' });
        } else {
            // verify the password, then set password
            if (!!user && crypto.verifyPassword(password, user.salt, user.hash)) {
                let token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + 3600,
                    data: user.username
                }, process.env.MY_SECRET);
                logger.info('login success');
                res.status(201).json({ token: token });
            } else {
                res.status(401).json({ message: 'Incorrect username or password' });
            }
        }
    });
});

router.get('/logout', function (req, res) {
    // blacklist token somehow until it expires

    res.redirect('/');
});

router.get('/test', security(), (req, res) => {
    res.status(200).send('ok');
});

exports = module.exports = router;