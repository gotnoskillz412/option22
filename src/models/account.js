'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Account = new Schema({
	username: String,
	password: String,
	email: String
});

exports = module.exports = mongoose.model('Account', Account);