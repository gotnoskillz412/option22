const jwt = require('jsonwebtoken');

function security () {
	return (req, res, next) => {
		// Check for token
		let token = req.headers.authorization.split(' ');
		token = token.length === 2 && token[0].toLowerCase() === 'bearer' ? token[1] : null;

		if (!token) {
			res.status(302).redirect('/auth/login');
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
}

exports = module.exports = security;