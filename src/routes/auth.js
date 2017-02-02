'use strict';

const express = require('express');
const router = express.Router();
const logger = require('winston');
const jwt = require('jsonwebtoken');

const account = require('../models/account');
const crypto = require('../services/crypto');

// TODO need salt and hash methods for passwords
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
	account.findOne({
		email: email
	}, (emailError) => {
		if (emailError) {
			account.findOne({
				username: username
			}, (usernameError) => {
				if (usernameError) {
					// TODO Check to make sure password meets constraints
					let password = req.body.password;

					// TODO Create a new user account
					let creds = crypto.generateSaltAndHash(password);
					let newAccount = new account({
						username: username,
						email: email,
						salt: creds.salt,
						hash: creds.hash
					})
				}
			});
		} else {
			// let them know email is taken
			res.status(400).json({'message': 'An account with this email already exists'});
		}
	});

	// later, verify email address
});

router.post('/login', (req, res) => {
	// Check credentials and then provide token
	var token;
	account.findOne({
		username: req.body.username
	}, (err, user) => {
		if (err) {
			//redirect with no user found error
		} else {
			// verify the password, then set password
		}
	});


	logger.info('login success');
	res.set('Access-Token', token);
	res.redirect('/');
});

router.get('/logout', function (req, res) {
	// blacklist token somehow until it expires

	res.redirect('/');
});

router.get('/test', (req, res) => {
	res.status(200).send('ok');
});

exports = module.exports = router;