'use strict';

const crypto = require('crypto');

const SALT_LENGTH = 32;

/**
 * @name generateSalt
 * @methodOf crypto
 * @description Generates a unique salt for each user
 * @param {int} length - The length of the generated salt
 * @returns {string} The salt
 */
const generateSalt = (length) => {
	return crypto.randomBytes(Math.ceil(length/2))
		.toString('hex')
		.slice(0, length);
};

/**
 * @name sha512
 * @methodOf crypto
 * @description Generates the hash based on the user's password and their personal salt
 * @param {string} password - The password provided by the user
 * @param {string} salt - The user's salt
 * @returns {string} The generated hash
 */
const sha512 = (password, salt) => {
	let hash = crypto.createHmac('sha512', salt);
	hash.update(password);
	return hash.digest('hex');
};

/**
 * @name generateSaltAndHash
 * @methodOf crypto
 * @param {string} password - The user provided password
 * @returns {{salt: string, hash: string}}
 */
const generateSaltAndHash = (password) => {
	let salt = generateSalt(SALT_LENGTH);
	let hash = sha512(password, salt);
	return {
		salt: salt,
		hash: hash
	};
};

/**
 * @name verifyPassword
 * @methodOf crypto
 * @param {string} password - The password provided at login
 * @param {string} salt - The salt for the user found in the json web token
 * @param {string} storedHash - The stored hash for the user found in the json web token
 * @returns {boolean} True if the password matches
 */
const verifyPassword = (password, salt, storedHash) => {
	return sha512(password, salt) === storedHash;
};

exports = module.exports = {
	generateSaltAndHash: generateSaltAndHash,
	verifyPassword: verifyPassword
};