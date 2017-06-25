'use strict';

const Account = require('../models/account.mongoose');
const logger = require('winston');
const Profile = require('../models/profile.mongoose');


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

exports = module.exports = {
    findAccount: findAccount,
    createAccount: createAccount,
    removeAccount: removeAccount,
    createProfile: createProfile
};