'use strict';

const express = require('express');
const router = express.Router();
const logger = require('winston');
const jwt = require('jsonwebtoken');

const security = require('../middleware/security');
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
	}, (emailError, emailUser) => {
		if (emailError) {
			res.status(500).json({message: 'Error registering'});
		} else if (!emailUser) {
			account.findOne({
				username: username
			}, (usernameError, usernameUser) => {
				if (usernameError){
					res.status(500).json({message: 'Error registering'});
				} else if (!usernameUser) {
					// TODO Check to make sure password meets constraints
					let password = req.body.password;

					// TODO Create a new user account
					let creds = crypto.generateSaltAndHash(password);
					let newAccount = new account({
						username: username,
						email: email,
						salt: creds.salt,
						hash: creds.hash
					});

					newAccount.save((err) => {
						if (err) {
							logger.error(err);
							res.status(500).json({message: 'Problem creating new account'});
						} else {
							logger.info('Succressfull created acount for: ', email);
							res.status(201).json({success: 'ok'});
						}
					})
				} else {
					res.status(400).json({'message': 'This username is already taken'});
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
	let username = req.body.username && req.body.username.toLowerCase();
	let password = req.body.password;
	account.findOne({
		username: username
	}, (err, user) => {
		if (err) {
			//redirect with no user found error
			res.status(400).json({message: 'Incorrect username or password'});
		} else {
			// verify the password, then set password
			if (!!user &&crypto.verifyPassword(password, user.salt, user.hash)) {
				let token = jwt.sign({
					exp: Math.floor(Date.now() / 1000) + (60 * 6),
					data: user.username
				}, process.env.MY_SECRET);
				logger.info('login success');
				res.status(200).json({token: token});
			} else {
				res.status(401).json({message: 'Incorrect username or password'});
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