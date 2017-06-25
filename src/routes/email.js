'use strict';

const express = require('express');
const nodemailer = require('nodemailer');
const logger = require('winston');

const router = express.Router();

// login
const smtpTransport = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: process.env.SERVICE_EMAIL,
		pass: process.env.EMAIL_PASSWORD
	}
});

const sendMail = function (name, fromAddress, subject, content, next) {
	let mailOptions = {
		from: `${name} <${fromAddress}>`,
		to: process.env.SERVICE_EMAIL,
		replyTo: fromAddress,
		subject: subject,
		html: content
	};

	smtpTransport.sendMail(mailOptions, next);
};

router.post('/', (req, res) => {
	if (req.body.email && req.body.name && req.body.subject && req.body.message) {
		let content = `<p>${req.body.message}</p>`;
		sendMail(req.body.name, req.body.email, req.body.subject, content, (error, info) => {
			if (error) {
				logger.error(error);
				res.status(500).json({message: 'Unable to send email at this time.'});
			} else {
				logger.info(info);
				res.status(201).json({message: 'Email sent successfully'});
			}
		});
	} else {
		console.log('bad email', req.body);
		res.status(400).json({message: 'Invalid email format'});
	}
});

exports = module.exports = router;