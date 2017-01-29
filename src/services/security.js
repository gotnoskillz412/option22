'use strict';

const security = function () {
	return (req, res, next) => {
		next();
	}
};

module.exports = security;