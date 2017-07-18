'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create the mongoose schema for a new user.
const Profile = new Schema({
    picture: { data: Buffer, contentType: String },
    description: String,
    likes: [String],
    email: String,
    username: String
});

exports = module.exports = mongoose.model('Profile', Profile);