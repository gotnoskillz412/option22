const express = require('express');

const logger = require('../utilities/logger');
const mongoHelpers = require('../helpers/mongoHelpers');

const router = new express.Router();

// get goals

router.get('/', (req, res) => {
    let profileGoals;
    mongoHelpers.findProfile({accountId: req.account._id})
        .then((profile) => {
            return mongoHelpers.findAllGoals({profileId: profile._id})
        })
        .then((goals) => {
            profileGoals = JSON.parse(JSON.stringify(goals));
            let promises = goals.map((goal) => {
                return mongoHelpers.findAllSubgoals({goalId: goal._id});
            });
            return Promise.all(promises);
        })
        .then((subgoals) => {
            profileGoals.forEach((goal, index) => {
                goal['subgoals'] = subgoals[index];
            });
            res.status(200).json({total: profileGoals.length, data: profileGoals});
        })
        .catch((err) => {
            logger.error('goals', 'Error getting goals', err);
            res.status(500).send('Internal server error retrieving goals');
        });
});

// add new goal
router.post('/', (req, res) => {
    let subgoals = req.body.subgoals && JSON.parse(JSON.stringify(req.body.subgoals));
    let profileGoal;
    delete req.body.subgoals;

    return mongoHelpers.addGoal(req.body)
        .then((goal) => {
        profileGoal = goal;
            let promises = subgoals.map((subgoal) => {
                subgoal.goalId = goal._id;
                return mongoHelpers.addSubgoal(subgoal);
            });
            return Promise.all(promises);
        })
        .then((subgoals) => {
            profileGoal.subgoals = subgoals;
            res.status(201).json(profileGoal);
        })
        .catch((err) => {
            logger.error('goals', 'Error adding a goal', err);
            res.status(500).send('Internal server error adding goal');
        });
});

// remove goal
router.delete('/:goalId', (req, res) => {
    return mongoHelpers.findGoal({_id: req.params.goalId})
        .then((goal) => {
            return mongoHelpers.findAllSubgoals({goalId: goal._id});
        })
        .then((subgoals) => {
            let promises = subgoals.map((subgoal) => {
                return mongoHelpers.removeSubgoal({_id: subgoal._id});
            });
            return Promise.all(promises);
        })
        .then(() => {
            return mongoHelpers.removeGoal({_id: req.params.goalId})
        })
        .then(() => {
            res.status(202).send('Deleted');
        }).catch((err) => {
            logger.error('goals', 'Error deleting goal', err);
            res.status(500).json({message: 'Internal server error deleting goal'});
        });
});

// get single goal

// update goal

exports = module.exports = router;