'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');

const AccountSetup = require('../utils/accountSetup');
const mongoHelpers = require('../../src/helpers/mongoHelpers');

const accountSetup = new AccountSetup();
const config = {
    urls: {
        collection: '/accounts/:accountId/profiles',
        detail: '/accounts/:accountId/profiles/:profileId'
    }
};

describe('Profile Tests', function () {
    let context = null;
    let account = null;
    let profile = null;
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

    describe('Profile Endpoint', () => {
        it('should test getting all profiles in an account', (done) => {
            context.client.get(config.urls.collection, {accountId: account._id})
                .then((res) => {
                    expect(res.statusCode).to.eql(200, `Expected ${res.statusCode} to be 200`);
                    expect(res.body.total).to.eql(1);
                    expect(res.body.data.length).to.eql(1);
                    expect(res.body.data[0].accountId).to.eql(account._id);
                    done();
                }).catch((err) => {
                    done(err);
                });
        });

        it('should test getting the profiles fails', (done) => {
            let findAllProfilesStub = this.sandbox.stub(mongoHelpers, 'findAllProfiles').callsFake(() => {
                return Promise.reject();
            });
            context.client.get(config.urls.collection, {accountId: account._id})
                .then(done)
                .catch((err) => {
                    expect(err.status).to.eql(500);
                    expect(err.response.res.body.message).to.eql('Could not find profiles');
                    expect(findAllProfilesStub.calledOnce).to.eql(true);
                    done();
                });
        });

        it('should test getting the profile', (done) => {
            context.client.get(config.urls.detail, {accountId: account._id, profileId: profile._id})
                .then((res) => {
                    expect(res.statusCode).to.eql(200);
                    expect(res.body._id).to.eql(profile._id);
                    done();
                })
                .catch(done);
        });

        it('should test a 500 to when getting the profile', (done) => {
            let findProfileStub = this.sandbox.stub(mongoHelpers, 'findProfile').callsFake(() => {
                return Promise.reject();
            });
            context.client.get(config.urls.detail, {accountId: account._id, profileId: profile._id})
                .then(done)
                .catch((err) => {
                    expect(err.status).to.eql(500);
                    expect(err.response.res.body.message).to.eql('Could not find profile');
                    expect(findProfileStub.calledOnce).to.eql(true);
                    done();
                });
        });

        it('should test a 404 to when getting the profile with malformed profileId', (done) => {
            context.client.get(config.urls.detail, {accountId: account._id, profileId: 'blah'})
                .then(done)
                .catch((err) => {
                    expect(err.status).to.eql(404);
                    done();
                });
        });

        it('should test a 404 to when getting the profile with good profileId', (done) => {
            context.client.get(config.urls.detail, {accountId: account._id, profileId: 'aaaaaaaaaaaaaaaaaaaaaaaa'})
                .then(done)
                .catch((err) => {
                    expect(err.status).to.eql(404);
                    done();
                });
        });

        it('should test updating the profile', (done) => {
            context.client.put(config.urls.detail, {likes: ['toast']} ,{accountId: account._id, profileId: profile._id})
                .then((res) => {
                    expect(res.statusCode).to.eql(200);
                    expect(res.body.likes.length).to.eql(1);
                    expect(res.body.likes[0]).to.eql('toast');
                    done();
                }).catch(done);
        });
    });
});