'use strict';

const express = require('express');
const nodemailer = require('nodemailer');

const logger = require('../utilities/logger');

const router = express.Router();
let response;

// Create the email transport
const smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.SERVICE_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * @function
 * @name sendMail
 * @methodOf email
 * @description Send an email to the provided email address in the env parameters
 *
 * @param {string} name The name of the person sending the email
 * @param {string} fromAddress The email to put in the replyTo section
 * @param {string} subject The subject of the email
 * @param {string} content The content of the email
 * @param {function} next The callback for after the email is sent
 */
const sendMail = (name, fromAddress, subject, content, next) => {
    let mailOptions = {
        from: `${name} <${fromAddress}>`,
        to: process.env.SERVICE_EMAIL,
        replyTo: fromAddress,
        subject: subject,
        html: content
    };

    smtpTransport.sendMail(mailOptions, next);
};

/**
 * @function
 * @name afterSend
 * @methodOf email
 * @description The callback to call after sending an email
 *
 * @param {object} error Not null if an error ocurred when sending the email
 */
const afterSend = (error) => {
    if (error) {
        logger.error('email', 'Error sending email', { error: error });
        response.status(500).json({ message: 'Unable to send email at this time.' });
    } else {
        logger.info('email', 'Email sent successfully');
        response.status(201).json({ message: 'Email sent successfully' });
    }
};

router.post('/', (req, res) => {
    response = null;
    if (req.body.email && req.body.name && req.body.subject && req.body.message) {
        let content = `<p>${req.body.message}</p>`;
        response = res;
        sendMail(req.body.name, req.body.email, req.body.subject, content, afterSend);
    } else {
        res.status(400).json({ message: 'Invalid email format' });
    }
});

setInterval(function () {
    sendMail('API Heartbeat', 'spencer.hockeborn.projects@gmail.com', 'Heartbeat', 'This is a heartbeat email from the API', function (error) {
        if (error) {
            logger.error('email', 'Error sending email', { error: error });
        } else {
            logger.info('email', 'Heartbeat email sent successfully');
        }
    });
}, 1800000);

exports = module.exports = router;