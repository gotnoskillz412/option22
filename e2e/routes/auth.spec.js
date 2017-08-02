'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const sinon = require('sinon');

const AccountSetup = require('../utils/accountSetup');
const cache = require('../../src/utilities/cache');
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
                .end((err, res) => {
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
                .end((err, res) => {
                    expect(res.statusCode).to.eql(400);
                    expect(res.body.message).to.eql('Account with that username already exists.');
                    done();
                });
        });
    });

    describe('Login endpoints', () => {
        it('should test the happy path', (done) => {
            context.client.post('/auth/login', {
                username: account.username,
                password: account.password
            }).then((res) => {
                expect(res.statusCode).to.eql(201);
                expect(res.body.token).to.not.be.null;
                expect(res.body.profile).to.not.be.null;
                expect(res.body.profile.username).to.eql(account.username.toLowerCase());
                expect(res.body.profile.email).to.eql(account.email.toLowerCase());
                done();
            }).catch(done);
        });

        it('should test the incorrect password', (done) => {
            account.password = 'blah';
            context.client.post('/auth/login', {
                username: account.username,
                password: account.password
            }).catch((err) => {
                expect(err.status).to.eql(401);
                expect(err.response.res.body.message).to.eql('Incorrect username or password');
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
            let newContext = null;
            let newAccount = new AccountSetup();
            newAccount.createAccount()
                .then((context) => {
                    newContext = context;
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