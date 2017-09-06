const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create the mongoose schema for a new user.
const TokenBlacklist = new Schema({
    token: String,
    added: {type: Date, expires: 3600, default: Date.now}
});

exports = module.exports = mongoose.model('TokenBlacklist', TokenBlacklist);