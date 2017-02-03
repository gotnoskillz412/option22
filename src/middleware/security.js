'use strict';

const jwt = require('jsonwebtoken');

/**
 * @module security
 * @description Checks for a token and verifies it for a logged in user.  Redirects to login page if token is not
 * 				present or is invalid.
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
			jwt.verify(token, process.env.MY_SECRET, (err, decodedToken) => {
				if (err) {
					res.status(401).json({message: 'Failed to authenticate the token'});
				} else {
					req.decoded = decodedToken;
					next();
				}
			});
		}
	}
};

exports = module.exports = security;