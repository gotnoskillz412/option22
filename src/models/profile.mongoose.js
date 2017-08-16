'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create the mongoose schema for a new user.
const Profile = new Schema({
    accountId: Schema.Types.ObjectId,
    description: String,
    firstName: String,
    lastName: String,
    likes: [String],
    picture: String
});

exports = module.exports = mongoose.model('Profile', Profile);