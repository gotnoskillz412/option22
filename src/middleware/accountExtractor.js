'use strict';
const mongoose = require('mongoose');

const logger = require('../utilities/logger');
const mongoHelpers = require('../helpers/mongoHelpers');

const accountExtractor = () => {
    return (req, res, next) => {
        let id = req.params.accountId;
        if (mongoose.Types.ObjectId.isValid(id)) {
            mongoHelpers.findAccount({_id: id}).then((act) => {
                if (!act) {
                    res.status(404).send();
                } else {
                    req.account = act;
                    next();
                }
            }).catch((err) => {
                logger.error('accountExtractor', 'Error checking account', {error: err});
                res.status(500).json({message: 'Error finding account'});
            });
        } else {
            res.status(404).send();
        }
    }
};

exports = module.exports = accountExtractor;