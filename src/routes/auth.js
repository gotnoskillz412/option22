'use strict';

const express = require('express');
const router = express.Router();
const logger = require('winston');
const jwt = require('jsonwebtoken');

const account = require('../models/account');

// TODO need salt and hash methods for passwords

router.post('/register', function () {

	// first check for if a user exists already

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