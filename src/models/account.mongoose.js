'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create the mongoose schema for a new user.
const Account = new Schema({
	username: String,
	email: String,
	salt: String,
	hash: String
});

exports = module.exports = mongoose.model('Account', Account);