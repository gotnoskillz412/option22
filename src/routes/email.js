'use strict';

const express = require('express');
const nodemailer = require('nodemailer');
const uuid = require('uuid/v1');

const logger = require('../utilities/logger');
const mongoHelpers = require('../helpers/mongoHelpers');
const PasswordReset = require('../models/passwordReset.mongoose');
const path = require('path');

const router = express.Router();
let response;

// Create the email transport
let smtpTransport;

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
const sendMail = (name, fromAddress, toAddress, subject, content, next) => {
    if (!smtpTransport) {
        try {
            smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.SERVICE_EMAIL,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        } catch (e) {
            logger.error('email', 'Error creating email transport', e);
        }
    }
    if (smtpTransport) {
        let mailOptions = {
            from: `${name} <${fromAddress}>`,
            to: toAddress,
            replyTo: fromAddress,
            subject: subject,
            html: content
        };

        smtpTransport.sendMail(mailOptions, next);
    }
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
        sendMail(req.body.name, req.body.email, process.env.SERVICE_EMAIL, req.body.subject, content, afterSend);
    } else {
        res.status(400).json({ message: 'Invalid email format' });
    }
});

router.post('/forgotPassword', (req, res) => {
    if (req.body.email) {
        //find account of lost password
        mongoHelpers.findAccount({email: req.body.email}).then((account) => {
            if (!account) {
                res.status(400).json({message: 'Could not find an account with the email provided.'});
            } else {
                // remove old links
                PasswordReset.remove({email: req.body.email}, () => {
                    let tempId = uuid();
                    let passwordReset = new PasswordReset({identifier: tempId, email: req.body.email});
                    passwordReset.save((err) => {
                        if (err) {
                            logger.error('email', 'Could not create temporary reset link', err);
                            res.status(500).json({message: 'Could not create temporary reset link'});
                        } else {
                            let link = encodeURI(path.join(process.env.BASE_WEB, `/passwordreset/${tempId}?email=${req.body.email}`));
                            //send email to user
                            let content = '<p>A password reset has been requested for this email. This link will be valid for 24 hours, or until another password reset request is requested. If you did not request a password reset, please ignore this email.</p>' +
                                '<p>Navigate to the address below to reset your email...</p>' +
                                `<p>${link}</p>`;
                            sendMail('Spencer Hockeborn', process.env.SERVICE_EMAIL, req.body.email, 'Goal Tending Password Reset Request', content, (err) => {
                                if (err) {
                                    logger.error('email', 'Error sending password reset email', { error: err });
                                    res.status(500).json({ message: 'Unable to send password reset request at this time.' });
                                } else {
                                    logger.info('email', 'Password reset email sent successfully');
                                    res.status(201).json({ message: 'Password reset email sent successfully' });
                                }
                            });
                        }
                    })
                });
            }
        })
    } else {
        res.status(400).json({message: 'Email is required'})
    }
});

exports = module.exports = router;