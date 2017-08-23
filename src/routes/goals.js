const express = require('express');

const logger = require('../utilities/logger');
const mongoHelpers = require('../helpers/mongoHelpers');

const router = new express.Router();

// get goals

router.get('/', (req, res) => {
    let profileGoals;
    mongoHelpers.findProfile({ accountId: req.account._id })
        .then((profile) => {
            return mongoHelpers.findAllGoals({ profileId: profile._id })
        })
        .then((goals) => {
            profileGoals = JSON.parse(JSON.stringify(goals));
            let promises = goals.map((goal) => {
                return mongoHelpers.findAllSubgoals({ goalId: goal._id });
            });
            return Promise.all(promises);
        })
        .then((subgoals) => {
            profileGoals.forEach((goal, index) => {
                goal['subgoals'] = subgoals[index];
            });
            res.status(200).json({ total: profileGoals.length, data: profileGoals });
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
            profileGoal.subgoals = JSON.parse(JSON.stringify(subgoals)) || [];
            res.status(201).json(profileGoal);
        })
        .catch((err) => {
            logger.error('goals', 'Error adding a goal', err);
            res.status(500).send('Internal server error adding goal');
        });
});

// remove goal
router.delete('/:goalId', (req, res) => {
    return mongoHelpers.findGoal({ _id: req.params.goalId })
        .then((goal) => {
            if (!goal) {
                res.status(404).send();
                return Promise.reject(404);
            }
            return mongoHelpers.findAllSubgoals({ goalId: goal._id });
        })
        .then((subgoals) => {
            let promises = subgoals.map((subgoal) => {
                return mongoHelpers.removeSubgoal({ _id: subgoal._id });
            });
            return Promise.all(promises);
        })
        .then(() => {
            return mongoHelpers.removeGoal({ _id: req.params.goalId })
        })
        .then(() => {
            res.status(202).send('Deleted');
        }).catch((err) => {
            if (err !== 404) {
                logger.error('goals', 'Error deleting goal', err);
                res.status(500).json({ message: 'Internal server error deleting goal' });
            }
        });
});

// get single goal
router.get('/:goalId', (req, res) => {
    let profileGoal;
    return mongoHelpers.findGoal({ _id: req.params.goalId })
        .then((goal) => {
            if (!goal) {
                res.status(404).send();
                return Promise.reject(404);
            }
            profileGoal = JSON.parse(JSON.stringify(goal));
            return mongoHelpers.findAllSubgoals({ goalId: goal._id });
        })
        .then((subgoals) => {
            profileGoal.subgoals = JSON.parse(JSON.stringify(subgoals)) || [];
            res.status(200).json(profileGoal);
        })
        .catch((err) => {
            if (err !== 404) {
                logger.error('goals', 'Error getting goal', err);
                res.status(500).json({ message: 'Internal server error getting goal' });
            }
        });
});

// update goal
router.put('/:goalId', (req, res) => {
    let updatedGoal = req.body;
    let updatedSubgoals = updatedGoal.subgoals && JSON.parse(JSON.stringify(updatedGoal.subgoals));
    let subgoalsToRemove;
    delete updatedGoal.subgoals;
    let goalPromises = [];
    let savedGoal;
    let savedSubgoals;

    goalPromises.push(new Promise((resolve, reject) => {
        mongoHelpers.findGoal({ _id: req.params.goalId })
            .then((goal) => {
                Object.keys(updatedGoal).forEach((key) => {
                    if (goal[key] !== updatedGoal[key]) {
                        goal[key] = updatedGoal[key];
                    }
                });
                goal.save((err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        savedGoal = JSON.parse(JSON.stringify(result));
                        resolve();
                    }
                });
            });
    }));
    goalPromises.push(new Promise((resolve, reject) => {
        mongoHelpers.findAllSubgoals({ goalId: updatedGoal._id })
            .then((subgoals) => {
                subgoalsToRemove = subgoals.filter((s) => {
                    let found = updatedSubgoals.find((us) => {
                        return s._id === us._id;
                    });
                    return !found;
                });
            })
            .then(() => {
                let subgoalPromises = updatedSubgoals.map((updatedSubgoal) => {
                    return new Promise((resolve2, reject2) => {
                        mongoHelpers.findSubgoal({_id: updatedSubgoal._id})
                            .then((sg) => {
                                Object.keys(updatedGoal).forEach((key) => {
                                    if (sg[key] !== updatedSubgoal[key]) {
                                        sg[key] = updatedSubgoal[key];
                                    }
                                });
                                sg.save((err, result) => {
                                    if (err) {
                                        reject2(err);
                                    } else {
                                        resolve2(result);
                                    }
                                });
                            });
                    });
                });
                return Promise.all(subgoalPromises);
            })
            .then((subgoals) => {
                savedSubgoals = JSON.parse(JSON.stringify(subgoals));
                return new Promise((resolve3, reject3) => {
                    subgoalsToRemove = subgoalsToRemove.map((sgtr) => {
                        return mongoHelpers.removeSubgoal({_id: sgtr._id});
                    });
                    Promise.all(subgoalsToRemove)
                        .then(resolve3, reject3);
                });
            })
            .then(resolve, reject);
    }));

    Promise.all(goalPromises).then(() => {
        savedGoal.subgoals = savedSubgoals || [];
    }).catch((err) => {
        logger.error('goals', 'Error updating goal and subgoals', err);
        res.status(500).json({message: 'Internal server error updating goal and subgoals'});
    });
});

exports = module.exports = router;