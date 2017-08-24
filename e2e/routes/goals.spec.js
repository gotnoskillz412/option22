'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');

const AccountSetup = require('../utils/accountSetup');
const mongoHelpers = require('../../src/helpers/mongoHelpers');

const accountSetup = new AccountSetup();
const config = {
    urls: {
        collection: '/accounts/:accountId/goals',
        detail: '/accounts/:accountId/goals/:goalId'
    }
};

describe('Goals Tests', function () {
    let context = null;
    let account = null;
    let profile = null;
    let savedGoal = null;
    let goalDescription = `Random Goal Description ${new Date()}`;
    let subgoalDescription = `Random Subgoal Description ${new Date()}`;
    before((done) => {
        accountSetup.createAccount().then((result) => {
            context = result;
            done();
        });
    });

    after((done) => {
        accountSetup.removeAccount().then(() => {
            done();
        });
    });

    beforeEach(() => {
        this.sandbox = new sinon.sandbox.create();
        account = JSON.parse(JSON.stringify(accountSetup.account));
        profile = JSON.parse(JSON.stringify(accountSetup.profile));
    });

    afterEach(() => {
        this.sandbox.restore();
    });

    describe('Goals Endpoint', () => {
        it('should test creating a goal in a profile succeeds', (done) => {
            context.client.post(
                config.urls.collection, {
                    description: goalDescription,
                    progress: 0,
                    profileId: profile._id,
                    completed: false,
                    subgoals: [{
                        description: subgoalDescription,
                        completed: false
                    }]
                }, {
                    accountId: account._id
                })
                .then((res) => {
                    expect(res.statusCode).to.eql(201, `Expected ${res.statusCode} to be 200`);
                    expect(res.body.profileId).to.eql(profile._id);
                    expect(res.body.description).to.eql(goalDescription);
                    expect(res.body.subgoals.length).to.eql(1);
                    expect(res.body.subgoals[0].goalId).to.eql(res.body._id);
                    expect(res.body.subgoals[0].description).to.eql(subgoalDescription);
                    savedGoal = JSON.parse(JSON.stringify(res.body));
                    done();
                })
                .catch(done);
        });

        it('should test creating a goal in a profile fails', (done) => {
            let addGoalStub = this.sandbox.stub(mongoHelpers, 'addGoal').callsFake(() => {
                return Promise.reject();
            });
            context.client.post(
                config.urls.collection, {
                    description: goalDescription,
                    progress: 0,
                    profileId: profile._id,
                    completed: false,
                    subgoals: [{
                        description: subgoalDescription,
                        completed: false
                    }]
                }, {
                    accountId: account._id
                })
                .then(done, (err) => {
                    expect(err.status).to.eql(500, `Expected ${err.status} to be 500`);
                    expect(err.response.res.body.message).to.eql('Internal server error adding goal');
                    expect(addGoalStub.calledOnce).to.eql(true);
                    done();
                })
        });

        it('should test getting all goals in an account succeeds', (done) => {
            context.client.get(config.urls.collection, { accountId: account._id })
                .then((res) => {
                    expect(res.statusCode).to.eql(200, `Expected ${res.statusCode} to be 200`);
                    expect(res.body.total).to.eql(1);
                    expect(res.body.data.length).to.eql(1);
                    expect(res.body.data[0]._id).to.eql(savedGoal._id);
                    expect(res.body.data[0].profileId).to.eql(profile._id);
                    expect(res.body.data[0].subgoals.length).to.eql(1);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('should test getting all goals in an account fails', (done) => {
            let findAllGoalsStub = this.sandbox.stub(mongoHelpers, 'findAllGoals').callsFake(() => {
                return Promise.reject();
            });
            context.client.get(config.urls.collection, { accountId: account._id })
                .then(done, (err) => {
                    expect(err.status).to.eql(500, `Expected ${err.status} to be 500`);
                    expect(err.response.res.body.message).to.eql('Internal server error retrieving goals');
                    expect(findAllGoalsStub.calledOnce).to.eql(true);
                    done();
                });
        });

        it('should test getting the specific goal succeeds', (done) => {
            context.client.get(config.urls.detail, { accountId: account._id, goalId: savedGoal._id })
                .then((res) => {
                    expect(res.statusCode).to.eql(200);
                    expect(res.body._id).to.eql(savedGoal._id);
                    expect(res.body.subgoals.length).to.eql(1);
                    done();
                })
                .catch(done);
        });

        it('should test getting the specific goal 404s', (done) => {
            context.client.get(config.urls.detail, { accountId: account._id, goalId: 'aaaaaaaaaaaaaaaaaaaaaaaa' })
                .then(done, (err) => {
                    expect(err.status).to.eql(404);
                    done();
                });
        });

        it('should test getting the specific goal fails', (done) => {
            let findGoalStub = this.sandbox.stub(mongoHelpers, 'findGoal').callsFake(() => {
                return Promise.reject();
            });
            context.client.get(config.urls.detail, { accountId: account._id, goalId: savedGoal._id })
                .then(done, (err) => {
                    expect(err.status).to.eql(500);
                    expect(err.response.res.body.message).to.eql('Internal server error getting goal');
                    expect(findGoalStub.calledOnce).to.eql(true);
                    done();
                });
        });

        it('should test updating the goal succeeds', (done) => {
            let updatedGoal = JSON.parse(JSON.stringify(savedGoal));
            updatedGoal.completed = true;
            context.client.put(config.urls.detail, updatedGoal, { accountId: account._id, goalId: savedGoal._id })
                .then((res) => {
                    expect(res.statusCode).to.eql(200);
                    expect(res.body._id).to.eql(savedGoal._id);
                    expect(res.body.completed).to.eql(true);
                    expect(res.body.subgoals.length).to.eql(1);
                    expect(res.body.subgoals[0].description).to.eql(subgoalDescription);
                    savedGoal = JSON.parse(JSON.stringify(res.body));
                    done();
                })
                .catch(done);
        });

        it('should test updating the goal succeeds with deleting subgoals', (done) => {
            let updatedGoal = JSON.parse(JSON.stringify(savedGoal));
            updatedGoal.subgoals = [];
            context.client.put(config.urls.detail, updatedGoal, { accountId: account._id, goalId: savedGoal._id })
                .then((res) => {
                    expect(res.statusCode).to.eql(200);
                    expect(res.body._id).to.eql(savedGoal._id);
                    expect(res.body.subgoals.length).to.eql(0);
                    savedGoal = JSON.parse(JSON.stringify(res.body));
                    done();
                })
                .catch(done);
        });

        it('should test updating the goal fails', (done) => {
            let findGoalStub = this.sandbox.stub(mongoHelpers, 'findGoal').callsFake(() => {
                return Promise.reject();
            });
            let updatedGoal = JSON.parse(JSON.stringify(savedGoal));
            context.client.put(config.urls.detail, updatedGoal, { accountId: account._id, goalId: savedGoal._id })
                .then(done, (err) => {
                    expect(err.status).to.eql(500);
                    expect(err.response.res.body.message).to.eql('Internal server error updating goal and subgoals');
                    expect(findGoalStub.calledOnce).to.eql(true);
                    done();
                });
        });

        it('should test updating the goal succeeds adding subgoals', (done) => {
            let updatedGoal = JSON.parse(JSON.stringify(savedGoal));
            updatedGoal.subgoals = [{
                description: subgoalDescription,
                completed: false,
                goalId: updatedGoal._id
            }];
            context.client.put(config.urls.detail, updatedGoal, { accountId: account._id, goalId: savedGoal._id })
                .then((res) => {
                    expect(res.statusCode).to.eql(200);
                    expect(res.body._id).to.eql(savedGoal._id);
                    expect(res.body.subgoals.length).to.eql(1);
                    expect(res.body.subgoals[0].description).to.eql(subgoalDescription);
                    savedGoal = JSON.parse(JSON.stringify(res.body));
                    done();
                })
                .catch(done);
        });

        it('should test deleting the goal succeeds', (done) => {
            context.client.remove(config.urls.detail, {accountId: account._id, goalId: savedGoal._id})
                .then((res) => {
                    expect(res.statusCode).to.eql(202);
                    done();
                })
                .catch(done);
        });

        it('should test deleting the goal 404s', (done) => {
            context.client.remove(config.urls.detail, {accountId: account._id, goalId: 'aaaaaaaaaaaaaaaaaaaaaaaa'})
                .then(done, (err) => {
                    expect(err.status).to.eql(404);
                    done();
                })
                .catch(done);
        });

        it('should test deleting the goal fails', (done) => {
            let findGoalStub = this.sandbox.stub(mongoHelpers, 'findGoal').callsFake(() => {
                return Promise.reject();
            });
            context.client.remove(config.urls.detail, { accountId: account._id, goalId: savedGoal._id })
                .then(done, (err) => {
                    expect(err.status).to.eql(500);
                    expect(err.response.res.body.message).to.eql('Internal server error deleting goal');
                    expect(findGoalStub.calledOnce).to.eql(true);
                    done();
                });
        });
    });
});