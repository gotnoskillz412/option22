'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');

const Account = require('../../src/models/account.mongoose');
const Goal = require('../../src/models/goal.mongoose');
const Profile = require('../../src/models/profile.mongoose');
const Subgoal = require('../../src/models/subgoal.mongoose');

const constants = require('../../src/helpers/constants.json');
const mongoHelpers = require('../../src/helpers/mongoHelpers');

describe('Mongo Helpers', function () {
    beforeEach(() => {
        this.sandbox = sinon.sandbox.create()
    });
    afterEach(() => {
        this.sandbox.restore()
    });

    it('should test the findAccount method (success)', (done) => {
        const findOneStub = this.sandbox.stub(Account, 'findOne').callsFake((params, cb) => {
            cb(null, 'success');
        });
        mongoHelpers.findAccount({}).then((result) => {
            expect(findOneStub.calledOnce).to.eql(true, 'Expected "findOneStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the findAccount method (failed)', (done) => {
        const findOneStub = this.sandbox.stub(Account, 'findOne').callsFake((params, cb) => {
            cb('err', null);
        });
        mongoHelpers.findAccount({}).then(done, (result) => {
            expect(findOneStub.calledOnce).to.eql(true, 'Expected "findOneStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.accountFind, `Expected '${result.step}' to be '${constants.mongo.steps.accountFind}'`);
            expect(result.message).to.eql('Error finding account', `Expected '${result.message}' to be 'Error finding account'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the createAccount method (succeed)', (done) => {
        const saveStub = this.sandbox.stub(Account.prototype, 'save').callsFake((cb) => {
            cb(null, 'success');
        });

        mongoHelpers.createAccount({}).then((result) => {
            expect(saveStub.calledOnce).to.eql(true, 'Expected "saveStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the createAccount method (failed)', (done) => {
        const saveStub = this.sandbox.stub(Account.prototype, 'save').callsFake((cb) => {
            cb('err', null);
        });
        mongoHelpers.createAccount({}).then(done, (result) => {
            expect(saveStub.calledOnce).to.eql(true, 'Expected "saveStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.accountCreate, `Expected '${result.step}' to be '${constants.mongo.steps.accountCreate}'`);
            expect(result.message).to.eql('Error creating account', `Expected '${result.message}' to be 'Error creating account'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the removeAccount method (succeed)', (done) => {
        const removeStub = this.sandbox.stub(Account, 'remove').callsFake((params, cb) => {
            cb(null, 'success');
        });

        mongoHelpers.removeAccount({}).then((result) => {
            expect(removeStub.calledOnce).to.eql(true, 'Expected "removeStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the removeAccount method (failed)', (done) => {
        const removeStub = this.sandbox.stub(Account, 'remove').callsFake((params, cb) => {
            cb('err', null);
        });

        mongoHelpers.removeAccount({}).then(done, (result) => {
            expect(removeStub.calledOnce).to.eql(true, 'Expected "removeStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.accountDelete, `Expected '${result.step}' to be '${constants.mongo.steps.accountDelete}'`);
            expect(result.message).to.eql('Error deleting account', `Expected '${result.message}' to be 'Error deleting account'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the createProfile method (succeed)', (done) => {
        const saveStub = this.sandbox.stub(Profile.prototype, 'save').callsFake((cb) => {
            cb(null, 'success');
        });

        mongoHelpers.createProfile({}).then((result) => {
            expect(saveStub.calledOnce).to.eql(true, 'Expected "saveStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the createProfile method (failed)', (done) => {
        const saveStub = this.sandbox.stub(Profile.prototype, 'save').callsFake((cb) => {
            cb('err', null);
        });

        mongoHelpers.createProfile({}).then(done, (result) => {
            expect(saveStub.calledOnce).to.eql(true, 'Expected "saveStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.profileCreate, `Expected '${result.step}' to be '${constants.mongo.steps.profileCreate}'`);
            expect(result.message).to.eql('Error creating profile', `Expected '${result.message}' to be 'Error creating profile'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the findProfile method (success)', (done) => {
        const findOneStub = this.sandbox.stub(Profile, 'findOne').callsFake((params, cb) => {
            cb(null, 'success');
        });
        mongoHelpers.findProfile({}).then((result) => {
            expect(findOneStub.calledOnce).to.eql(true, 'Expected "findOneStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the findProfile method (failed)', (done) => {
        const findOneStub = this.sandbox.stub(Profile, 'findOne').callsFake((params, cb) => {
            cb('err', null);
        });
        mongoHelpers.findProfile({}).then(done, (result) => {
            expect(findOneStub.calledOnce).to.eql(true, 'Expected "findOneStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.profileFind, `Expected '${result.step}' to be '${constants.mongo.steps.profileFind}'`);
            expect(result.message).to.eql('Error finding profile', `Expected '${result.message}' to be 'Error finding profile'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the findAllProfiles method (success)', (done) => {
        const findStub = this.sandbox.stub(Profile, 'find').callsFake((params, cb) => {
            cb(null, 'success');
        });
        mongoHelpers.findAllProfiles({}).then((result) => {
            expect(findStub.calledOnce).to.eql(true, 'Expected "findStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the findAllProfiles method (failed)', (done) => {
        const findStub = this.sandbox.stub(Profile, 'find').callsFake((params, cb) => {
            cb('err', null);
        });
        mongoHelpers.findAllProfiles({}).then(done, (result) => {
            expect(findStub.calledOnce).to.eql(true, 'Expected "findStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.profileFindAll, `Expected '${result.step}' to be '${constants.mongo.steps.profileFindAll}'`);
            expect(result.message).to.eql('Error finding profiles', `Expected '${result.message}' to be 'Error finding profiles'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the removeProfile method (success)', (done) => {
        const removeStub = this.sandbox.stub(Profile, 'remove').callsFake((params, cb) => {
            cb(null, 'success');
        });
        mongoHelpers.removeProfile({}).then((result) => {
            expect(removeStub.calledOnce).to.eql(true, 'Expected "removeStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the removeProfile method (failed)', (done) => {
        const removeStub = this.sandbox.stub(Profile, 'remove').callsFake((params, cb) => {
            cb('err', null);
        });
        mongoHelpers.removeProfile({}).then(done, (result) => {
            expect(removeStub.calledOnce).to.eql(true, 'Expected "removeStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.profileDelete, `Expected '${result.step}' to be '${constants.mongo.steps.profileDelete}'`);
            expect(result.message).to.eql('Error deleting profile', `Expected '${result.message}' to be 'Error deleting profile'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the addGoal method (succeed)', (done) => {
        const saveStub = this.sandbox.stub(Goal.prototype, 'save').callsFake((cb) => {
            cb(null, 'success');
        });

        mongoHelpers.addGoal({}).then((result) => {
            expect(saveStub.calledOnce).to.eql(true, 'Expected "saveStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the createGoal method (failed)', (done) => {
        const saveStub = this.sandbox.stub(Goal.prototype, 'save').callsFake((cb) => {
            cb('err', null);
        });

        mongoHelpers.addGoal({}).then(done, (result) => {
            expect(saveStub.calledOnce).to.eql(true, 'Expected "saveStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.goalAdd, `Expected '${result.step}' to be '${constants.mongo.steps.goalAdd}'`);
            expect(result.message).to.eql('Error adding goal', `Expected '${result.message}' to be 'Error adding goal'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the findGoal method (success)', (done) => {
        const findOneStub = this.sandbox.stub(Goal, 'findOne').callsFake((params, cb) => {
            cb(null, 'success');
        });
        mongoHelpers.findGoal({}).then((result) => {
            expect(findOneStub.calledOnce).to.eql(true, 'Expected "findOneStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the findGoal method (failed)', (done) => {
        const findOneStub = this.sandbox.stub(Goal, 'findOne').callsFake((params, cb) => {
            cb('err', null);
        });
        mongoHelpers.findGoal({}).then(done, (result) => {
            expect(findOneStub.calledOnce).to.eql(true, 'Expected "findOneStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.goalFind, `Expected '${result.step}' to be '${constants.mongo.steps.goalFind}'`);
            expect(result.message).to.eql('Error finding goal', `Expected '${result.message}' to be 'Error finding goal'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the findAllGoals method (success)', (done) => {
        const findStub = this.sandbox.stub(Goal, 'find').callsFake((params, cb) => {
            cb(null, 'success');
        });
        mongoHelpers.findAllGoals({}).then((result) => {
            expect(findStub.calledOnce).to.eql(true, 'Expected "findStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the findAllGoals method (failed)', (done) => {
        const findStub = this.sandbox.stub(Goal, 'find').callsFake((params, cb) => {
            cb('err', null);
        });
        mongoHelpers.findAllGoals({}).then(done, (result) => {
            expect(findStub.calledOnce).to.eql(true, 'Expected "findStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.goalFindAll, `Expected '${result.step}' to be '${constants.mongo.steps.goalFindAll}'`);
            expect(result.message).to.eql('Error finding goals', `Expected '${result.message}' to be 'Error finding goal'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the removeGoal method (success)', (done) => {
        const removeStub = this.sandbox.stub(Goal, 'remove').callsFake((params, cb) => {
            cb(null, 'success');
        });
        mongoHelpers.removeGoal({}).then((result) => {
            expect(removeStub.calledOnce).to.eql(true, 'Expected "removeStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the removeGoal method (failed)', (done) => {
        const removeStub = this.sandbox.stub(Goal, 'remove').callsFake((params, cb) => {
            cb('err', null);
        });
        mongoHelpers.removeGoal({}).then(done, (result) => {
            expect(removeStub.calledOnce).to.eql(true, 'Expected "removeStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.goalDelete, `Expected '${result.step}' to be '${constants.mongo.steps.goalDelete}'`);
            expect(result.message).to.eql('Error deleting goal', `Expected '${result.message}' to be 'Error deleting goal'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the addSubgoal method (succeed)', (done) => {
        const saveStub = this.sandbox.stub(Subgoal.prototype, 'save').callsFake((cb) => {
            cb(null, 'success');
        });

        mongoHelpers.addSubgoal({}).then((result) => {
            expect(saveStub.calledOnce).to.eql(true, 'Expected "saveStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the createSubgoal method (failed)', (done) => {
        const saveStub = this.sandbox.stub(Subgoal.prototype, 'save').callsFake((cb) => {
            cb('err', null);
        });

        mongoHelpers.addSubgoal({}).then(done, (result) => {
            expect(saveStub.calledOnce).to.eql(true, 'Expected "saveStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.subgoalAdd, `Expected '${result.step}' to be '${constants.mongo.steps.subgoalAdd}'`);
            expect(result.message).to.eql('Error adding subgoal', `Expected '${result.message}' to be 'Error adding subgoal'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the findSubgoal method (success)', (done) => {
        const findOneStub = this.sandbox.stub(Subgoal, 'findOne').callsFake((params, cb) => {
            cb(null, 'success');
        });
        mongoHelpers.findSubgoal({}).then((result) => {
            expect(findOneStub.calledOnce).to.eql(true, 'Expected "findOneStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the findSubgoal method (failed)', (done) => {
        const findOneStub = this.sandbox.stub(Subgoal, 'findOne').callsFake((params, cb) => {
            cb('err', null);
        });
        mongoHelpers.findSubgoal({}).then(done, (result) => {
            expect(findOneStub.calledOnce).to.eql(true, 'Expected "findOneStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.subgoalFind, `Expected '${result.step}' to be '${constants.mongo.steps.subgoalFind}'`);
            expect(result.message).to.eql('Error finding subgoal', `Expected '${result.message}' to be 'Error finding subgoal'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the findAllSubgoals method (success)', (done) => {
        const findStub = this.sandbox.stub(Subgoal, 'find').callsFake((params, cb) => {
            cb(null, 'success');
        });
        mongoHelpers.findAllSubgoals({}).then((result) => {
            expect(findStub.calledOnce).to.eql(true, 'Expected "findStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the findAllSubgoals method (failed)', (done) => {
        const findStub = this.sandbox.stub(Subgoal, 'find').callsFake((params, cb) => {
            cb('err', null);
        });
        mongoHelpers.findAllSubgoals({}).then(done, (result) => {
            expect(findStub.calledOnce).to.eql(true, 'Expected "findStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.subgoalFindAll, `Expected '${result.step}' to be '${constants.mongo.steps.subgoalFindAll}'`);
            expect(result.message).to.eql('Error finding subgoals', `Expected '${result.message}' to be 'Error finding subgoal'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });

    it('should test the removeSubgoal method (success)', (done) => {
        const removeStub = this.sandbox.stub(Subgoal, 'remove').callsFake((params, cb) => {
            cb(null, 'success');
        });
        mongoHelpers.removeSubgoal({}).then((result) => {
            expect(removeStub.calledOnce).to.eql(true, 'Expected "removeStub" to be called once');
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the removeSubgoal method (failed)', (done) => {
        const removeStub = this.sandbox.stub(Subgoal, 'remove').callsFake((params, cb) => {
            cb('err', null);
        });
        mongoHelpers.removeSubgoal({}).then(done, (result) => {
            expect(removeStub.calledOnce).to.eql(true, 'Expected "removeStub" to be called once');
            expect(result.step).to.eql(constants.mongo.steps.subgoalDelete, `Expected '${result.step}' to be '${constants.mongo.steps.subgoalDelete}'`);
            expect(result.message).to.eql('Error deleting subgoal', `Expected '${result.message}' to be 'Error deleting subgoal'`);
            expect(result.error).to.eql('err', `Expected '${result.message}' to be 'err'`);
            done();
        });
    });
});