'use strict';

const jwt = require('jsonwebtoken');

const cache = require('../services/cache');
const constants = require('../helpers/constants');

/**
 * @module security
 * @description Checks for a token and verifies it for a logged in user.
 *
 * @returns {function(*, *, *)}
 */
const security = () => {
	return (req, res, next) => {
		// Check for token
		let token = req.headers.authorization && req.headers.authorization.split(' ');
		token = token && token.length === 2 && token[0].toLowerCase() === 'bearer' ? token[1] : null;

		if (!token) {
			res.status(401).json({message: 'Unauthorized: No token provided'});
		} else {
            cache.get(constants.blacklistPrefix + token, (err, response) => {
            	if (response) {
                    res.status(401).json({message: 'Old token provided'});
				} else if (err) {
            	    res.status(500).json({message: 'Error checking old token'});
                } else {
                    jwt.verify(token, process.env.MY_SECRET, (err, decodedToken) => {
                        if (err) {
                            res.status(401).json({message: 'Failed to authenticate the token'});
                        } else {
                            req.decoded = decodedToken;
                            next();
                        }
                    });
				}
			});
		}
	}
};

exports = module.exports = security;