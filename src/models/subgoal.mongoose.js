'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create the mongoose schema for a new user.
const Subgoal = new Schema({
    goalId: Schema.Types.ObjectId,
    description: String,
    complete: Boolean
});

exports = module.exports = mongoose.model('Subgoal', Subgoal);