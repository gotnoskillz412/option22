'use strict';

const Account = require('../models/account.mongoose');
const constants = require('./constants');
const logger = require('../utilities/logger');
const Profile = require('../models/profile.mongoose');


/**
 * @name findAccount
 * @methodOf mongoHelpers
 * @description A wrapper around the mongoose findOne method in order to use promises.  Finds an account based on provided params.
 * @param {object} params - The parameters used to find the account
 * @returns {Promise} - Resolves with the found account
 */
const findAccount = (params) => {
    return new Promise(function (resolve, reject) {
        Account.findOne(params, (err, result) => {
            if (err) {
                reject({step: constants.mongo.steps.accountFind, message: 'Error finding account', error: err });
            } else {
                resolve(result);
            }
        });
    });
};

/**
 * @name createAccount
 * @methodOf mongoHelpers
 * @description A wrapper around the mongoose save method in order to use promises.  Creates an account based on provided params.
 * @param {object} params - The params used to create an account
 * @returns {Promise} - Resolves with the created account
 */
const createAccount = (params) => {
    return new Promise(function (resolve, reject) {
        let account = new Account(params);
        account.save((err, result) => {
            if (err) {
                reject({step: constants.mongo.steps.accountCreate, message: 'Error creating account', error: err });
            } else {
                logger.info('mongooseHelpers', `Successfully created acount for: ${params.email}`);
                resolve(result);
            }
        });
    });
};

/**
 * @name removeAccount
 * @methodOf mongoHelpers
 * @description A wrapper around the mongoose remove method in order to use promises.  Removes an account based on provided params.
 * @param {object} params - The parameters used to find the account to be removed
 * @returns {Promise} - Resolves with the removed account
 */
const removeAccount = (params) => {
    return new Promise(function (resolve, reject) {
        Account.remove(params, (err, result) => {
            if (err) {
                reject({step: constants.mongo.steps.accountDelete, message: 'Error deleting account', error: err });
            } else {
                logger.info('mongooseHelpers', `Successfully removed acount for: ${params.email}`);
                resolve(result);
            }
        });
    });
};

/**
 * @name createProfile
 * @methodOf mongoHelpers
 * @description A wrapper around the mongoose save method in order to use promises.  Creates a profile based on provided params.
 * @param {object} params - Parameters used to create profile
 * @returns {Promise} - Resolves with the created profile
 */
const createProfile = (params) => {
    return new Promise(function (resolve, reject) {
        let profile = new Profile(params);
        profile.save((err, result) => {
            if (err) {
                reject({step: constants.mongo.steps.profileCreate, message: 'Error creating profile', error: err });
            } else {
                logger.info('mongooseHelpers', `Successfully created profile for: ${params.email}`);
                resolve(result);
            }
        });
    });
};

/**
 * @name findProfile
 * @methodOf mongoHelpers
 * @description A wrapper around the mongoose findOne method in order to use promises.  Finds a profile based on provided params.
 * @param {object} params - Parameters used to find the profile
 * @returns {Promise} - Resolves with the found profile
 */
const findProfile = (params) => {
    return new Promise(function (resolve, reject) {
        Profile.findOne(params, (err, result) => {
            if (err) {
                reject({step: constants.mongo.steps.profileFind, message: 'Error finding profile', error: err });
            } else {
                resolve(result);
            }
        });
    });
};

exports = module.exports = {
    findAccount: findAccount,
    createAccount: createAccount,
    removeAccount: removeAccount,
    createProfile: createProfile,
    findProfile: findProfile
};