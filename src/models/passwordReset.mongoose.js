const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create the mongoose schema for a new user.
const PasswordReset = new Schema({
    email: String,
    identifier: String,
    added: {type: Date, expires: 86400, default: Date.now}
});

exports = module.exports = mongoose.model('PasswordReset', PasswordReset);