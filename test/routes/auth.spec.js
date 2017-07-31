'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const express = require('express');
const sinon = require('sinon');

const cache = require('../../src/utilities/cache');
const jwt = require('jsonwebtoken');
const mongoHelpers = require('../../src/helpers/mongoHelpers');

const server = require('../../src/app');

chai.use(chaiHttp);

describe('Auth Tests', function () {
    let accountCreated = false;
    let profileCreated = false;
    let token;

    const now = new Date().getTime();
    let account = null;
    let decodedToken = null;

    beforeEach(() => {
        account = {
            email: 'e2eUser@test.com_' + now,
            username: 'e2eUser_' + now,
            password: 'password0'
        };
        decodedToken = {
            email: account.email,
            username: account.username
        };

        this.sandbox = new sinon.sandbox.create();
        this.sandbox.stub(cache, 'get').callsFake((key, cb) => {
            cb(null, null);
        });
        this.sandbox.stub(jwt, 'verify').callsFake((token, secret, cb) => {
            cb(null, decodedToken)
        });
    });

    afterEach(() => {
        this.sandbox.restore();
    });

    describe('Register endpoint', () => {
        it('should test the register happy path', (done) => {
            chai.request(server)
                .post('/auth/register')
                .send(account)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        accountCreated = true;
                        profileCreated = true;
                        expect(res.statusCode).to.eql(201);
                        expect(res.body.token).to.not.be.null;
                        token = res.body.token;
                        expect(res.body.profile).to.not.be.null;
                        expect(res.body.profile.username).to.eql(account.username.toLowerCase());
                        expect(res.body.profile.email).to.eql(account.email.toLowerCase());
                        done();
                    }
                });
        });

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
            account.email = 'test@test.com';
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
            chai.request(server)
                .post('/auth/login')
                .send({
                    username: account.username,
                    password: account.password
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res.statusCode).to.eql(201);
                        expect(res.body.token).to.not.be.null;
                        expect(res.body.profile).to.not.be.null;
                        expect(res.body.profile.username).to.eql(account.username.toLowerCase());
                        expect(res.body.profile.email).to.eql(account.email.toLowerCase());
                        done();
                    }
                });
        });

        it('should test the incorrect password', (done) => {
            account.password = 'blah';
            chai.request(server)
                .post('/auth/login')
                .send({
                    username: account.username,
                    password: account.password
                })
                .end((err, res) => {
                    expect(res.statusCode).to.eql(401);
                    expect(res.body.message).to.eql('Incorrect username or password');
                    done();
                });
        });
    });

    describe('Logout endpoints', () => {
        it('should test the happy path', (done) => {
            chai.request(server)
                .get('/auth/logout')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res.statusCode).to.eql(200);
                        expect(res.body.ok).to.eql(true);
                        done();
                    }
                });
        });

        it('should test the happy path (with redirect)', (done) => {
            chai.request(server)
                .get('/auth/logout')
                .redirects(0)
                .set('Authorization', `Bearer ${token}`)
                .query({'redirect_uri': 'test.com'})
                .end((err, res) => {
                    expect(res.statusCode).to.eql(302);
                    done();
                });
        });
    });

    describe('Cleanup', () => {
        it('should clean up the account', (done) => {
            mongoHelpers.findAccount({ username: account.username.toLowerCase() }).then((act) => {
                if (accountCreated) {
                    expect(act).to.not.be.null;
                }
                return new Promise((resolve) => {
                    if (act) {
                        mongoHelpers.removeAccount({ username: account.username.toLowerCase() }).then(resolve);
                    } else {
                        resolve();
                    }
                });
            })
                .then(() => {
                    mongoHelpers.findProfile({ username: account.username.toLowerCase() }).then((profile) => {
                        if (profile) {
                            expect(profile).to.not.be.null;
                        }
                        return new Promise((resolve) => {
                            if (profile) {
                                mongoHelpers.removeProfile({ username: account.username.toLowerCase() }).then(resolve);
                            } else {
                                resolve();
                            }
                        });
                    });
                })
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });
});