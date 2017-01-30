'use strict';

const express = require('express');
const passport = require('passport');
const Account = require('../models/account');
const router = express.Router();
const logger = require('winston');


router.post('/register', function (req, res) {

});

router.post('/login', (req, res) => {
	logger.info('login succes', req.session, req.user);
	res.redirect('/');
});

router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

router.get('/test', (req, res) => {
	res.status(200).send('ok');
});

exports = module.exports = router;