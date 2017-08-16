'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create the mongoose schema for a new user.
const Account = new Schema({
    email: String,
    hash: String,
    salt: String,
    username: String
});

exports = module.exports = mongoose.model('Account', Account);