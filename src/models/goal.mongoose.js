'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create the mongoose schema for a new user.
const Goal = new Schema({
    profileId: Schema.Types.ObjectId,
    description: String,
    progress: Number,
    startDate: String,
    finishDate: String
});

exports = module.exports = mongoose.model('Goal', Goal);