'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');

const Account = require('../models/account.mongoose');
const Profile = require('../models/profile.mongoose');

const mongoHelpers = require('./mongoHelpers');

describe('Mongo Helpers', () => {
    beforeEach(() => {
        this.sandbox = sinon.sandbox.create()
    });
    afterEach(() => {
        this.sandbox.restore()
    });

    it('should test the findAccount method', (done) => {
        const findOneStub = this.sandbox.stub(Account, 'findOne').callsFake( (params, cb) => {
            cb(null, 'success');
        });
        mongoHelpers.findAccount({}).then((result) => {
            expect(findOneStub.calledOnce).to.eql(true, `Expected 'findOneStub' to be called once`);
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the createAccount method', (done) => {
        const saveStub = this.sandbox.stub(Account.prototype, 'save').callsFake( (cb) => {
            cb(null, 'success');
        });

        mongoHelpers.createAccount({}).then((result) => {
            expect(saveStub.calledOnce).to.eql(true, `Expected 'saveStub' to be called once`);
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });

    it('should test the removeAccount method', (done) => {
        const removeStub = this.sandbox.stub(Account, 'remove').callsFake( (params, cb) => {
            cb(null, 'success');
        });

        mongoHelpers.removeAccount({}).then((result) => {
            expect(removeStub.calledOnce).to.eql(true, `Expected 'removeStub' to be called once`);
            expect(result).to.eql('success', `Expected '${result}' to be 'success'`);
            done();
        }, done);
    });
});