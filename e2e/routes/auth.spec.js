'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;

const AccountSetup = require('../utils/accountSetup');
const server = require('../../src/app');

chai.use(chaiHttp);

describe('Auth Tests', function () {
    const accountSetup = new AccountSetup();
    let context;
    let account = null;

    before((done) => {
        accountSetup.createAccount().then((response) => {
            context = response;
            done();
        }, done);
    });

    after((done) => {
        accountSetup.removeAccount().then(() => {
            done()
        }, done);
    });

    beforeEach((done) => {
        account = JSON.parse(JSON.stringify(accountSetup.account));
        done();
    });

    describe('Register endpoint', () => {
        it('should test the register fails with email already exists', (done) => {
            chai.request(server)
                .post('/auth/register')
                .send(account)
                .end((err, res) => { // eslint-disable-line handle-callback-err
                    expect(res.statusCode).to.eql(400);
                    expect(res.body.message).to.eql('Account with that email already exists.');
                    done();
                });
        });

        it('should test the register fails with username already exists', (done) => {
            account.email = `${new Date().getTime()}_test@test.com`;
            chai.request(server)
                .post('/auth/register')
                .send(account)
                .end((err, res) => { // eslint-disable-line handle-callback-err
                    expect(res.statusCode).to.eql(400);
                    expect(res.body.message).to.eql('Account with that username already exists.');
                    done();
                });
        });

        it('should test the register fails with username not meeting requirements', (done) => {
            account.email = `${new Date().getTime()}_test@test.com`;
            account.password = 'Password0';
            account.username = 'test'; // not long enough
            chai.request(server)
                .post('/auth/register')
                .send(account)
                .end((err, res) => { // eslint-disable-line handle-callback-err
                    expect(res.statusCode).to.eql(400);
                    expect(res.body.message).to.eql('Username must be alphanumeric and between 5 and 50 characters.');
                    done();
                });
        });

        it('should test the register fails the password not meeting requirments', (done) => {
            account.email = `${new Date().getTime()}_test@test.com`;
            account.username = 'testWorks';
            account.password = 'short';
            chai.request(server)
                .post('/auth/register')
                .send(account)
                .end((err, res) => { // eslint-disable-line handle-callback-err
                    expect(res.statusCode).to.eql(400);
                    expect(res.body.message).to.eql('Password did not meet requirements.');
                    done();
                });
        });
    });

    describe('Login endpoints', () => {
        it('should test the happy path', (done) => {
            context.client.post('/auth/login', {
                username: account.username,
                password: 'Password0'
            }).then((res) => {
                expect(res.statusCode).to.eql(201);
                expect(res.body.token).to.not.be.null;
                expect(res.body.account).to.not.be.null;
                expect(res.body.token).to.not.be.null;
                expect(res.body.account.username).to.eql(account.username.toLowerCase());
                expect(res.body.account.email).to.eql(account.email.toLowerCase());
                expect(res.body.profile).to.not.be.null;
                expect(res.body.profile.accountId).to.eql(res.body.account._id);
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('should test the incorrect password', (done) => {
            context.client.post('/auth/login', {
                username: account.username,
                password: 'blah'
            }).catch((err) => {
                expect(err.status).to.eql(401);
                expect(err.response.res.body.message).to.eql('Incorrect username or password');
                done()
            });
        });
    });

    describe('Get Account endpoints', () => {
        it('should test the happy path', (done) => {
            context.client.get('/auth/account')
                .then((res) => {
                    expect(res.statusCode).to.eql(200);
                    expect(res.body.profile).to.not.be.null;
                    expect(res.body.account).to.not.be.null;
                    done();
                }).catch(done);
        });
    });

    describe('Update email and username endpoint', () => {
        it('should test happy path for updating username and password', (done) => {
            let username = `joebob_${new Date().getTime()}`;
            let email = `test2_${new Date().getTime()}@test.com`;
            context.client.put('/auth/account/:accountId/update', {
                username: username,
                email: email
            }, {
                accountId: account._id
            })
                .then((res) => {
                    expect(res.statusCode).to.eql(200);
                    expect(res.body.token).to.not.be.null;
                    accountSetup.token = res.body.token;
                    expect(res.body.account.email).to.eql(email);
                    expect(res.body.account.username).to.eql(username);
                    done()
                }).catch(done);
        });
    });

    describe('Update Password endpoint', () => {
        it('should test successfully updated password', (done) => {
            context.client.put('/auth/account/:accountId/password', {
                currentPassword: 'Password0',
                newPassword: 'Password1'
            }, {
                accountId: account._id
            })
                .then((res) => {
                    expect(res.statusCode).to.eql(200);
                    expect(res.body.token).to.not.be.null;
                    accountSetup.token = res.body.token;
                    done()
                }).catch(done);
        });

        it('should test trying to update password with wrong current password', (done) => {
            context.client.put('/auth/account/:accountId/password', {
                currentPassword: 'Password5',
                newPassword: 'Password2'
            }, {
                accountId: account._id
            })
                .then(done)
                .catch((err) => {
                    expect(err.status).to.eql(400);
                    expect(err.response.res.body.message).to.eql('Incorrect password');
                    done()
                });
        });
    });

    describe('Logout endpoints', () => {
        it('should test the happy path', (done) => {
            context.client.get('/auth/logout')
                .then((res) => {
                    expect(res.statusCode).to.eql(200);
                    expect(res.body.ok).to.eql(true);
                    done();
                }).catch(done);
        });

        it('should test the happy path (with redirect)', (done) => {
            let newAccount = new AccountSetup();
            newAccount.createAccount()
                .then((context) => {
                    context.client.get('/auth/logout', { 'redirect_uri': 'test.com' })
                        .catch((err) => {  // for some reason, chai-http sees redirects as failures. lame
                            expect(err.status).to.eql(302);
                            newAccount.removeAccount().then(() => {
                                done();
                            });
                        });
                }).catch(done);
        });
    });
});