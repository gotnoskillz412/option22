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

describe('Crypto Tests', function () {
    let accountCreated = false;
    let profileCreated = false;

    const now = new Date().getTime();
    const account = {
        email: 'e2eUser@test.com_' + now,
        username: 'e2eUser_' + now,
        password: 'password0'
    };

    const decodedToken = {
        email: account.email,
        username: account.username
    };

    beforeEach(() => {
        this.sandbox = new sinon.sandbox.create();
        this.sandbox.stub(cache, 'get').callsFake((key, cb) => {
            cb(null, null);
        });
        this.sandbox.stub(jwt, 'verify').callsFake((key, cb) => {
            cb(null, decodedToken)
        });
    });

    afterEach(() => {
        this.sandbox.restore();
    });

    describe('Auth Endpoints', () => {
        it('should test the register happy path', (done) => {
            chai.request(server)
                .post('/auth/register')
                .send(account)
                .end((err, res) => {
                    if (!err) {
                        accountCreated = true;
                        profileCreated = true;
                    }
                    expect(res.statusCode).to.eql(201);
                    expect(res.body.token).to.not.be.null;
                    expect(res.body.profile).to.not.be.null;
                    expect(res.body.profile.username).to.eql(account.username.toLowerCase());
                    expect(res.body.profile.email).to.eql(account.email.toLowerCase());
                    done();
                });
        });

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