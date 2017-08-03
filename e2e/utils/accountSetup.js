'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const path = require('path');
const querystring = require('querystring');

const mongoHelpers = require('../../src/helpers/mongoHelpers');
const server = require('../../src/app');

chai.use(chaiHttp);

const AccountSetup = function () {
    this.token = null;
    this.profile = null;
    this.client = null;
    this.account = null;
    this.profile = null;
};

AccountSetup.defaultOptions = () => {
    const now = new Date().getTime();
    const random = Math.floor(Math.random()*10000);
    return {
        account: {
            email: `e2eUser@test.com_${now}_${random}`,
            username: `e2eUser_${now}_${random}`,
            password: 'password0'
        }
    }
};

AccountSetup.addParameters = function (url, query) {
    if (!query) {
        return url;
    }
    let temp = JSON.parse(JSON.stringify(query));
    let pathArray = url.split('/');
    pathArray = pathArray.map((value) => {
        if (value[0] === ':' && query[value.substring(1)] ) {
            delete temp[value.substring(1)];
            return query[value.substring(1)];
        }
        return value;
    });
    return `${pathArray.join('/')}?${querystring.stringify(temp)}`;
};

AccountSetup.prototype.getContext = function () {
    return {
        client: {
            get: (url, query) => {
                return new Promise((resolve, reject) => {
                    try {
                        chai.request(server).get(AccountSetup.addParameters(url, query))
                            .redirects(0)
                            .set('Authorization', `Bearer ${this.token}`)
                            .set('Accept', 'application/json')
                            .end((err, res) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(res);
                                }
                            });
                    } catch (e) {
                        reject(e);
                    }
                });
            },
            post: (url, body, query) => {
                return new Promise((resolve, reject) => {
                    try {
                        chai.request(server).post(AccountSetup.addParameters(url, query))
                            .set('Authorization', `Bearer ${this.token}`)
                            .set('Content-Type', 'application/json')
                            .set('Accept', 'application/json')
                            .send(body)
                            .end((err, res) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(res);
                                }
                            });
                    } catch (e) {
                        reject(e)
                    }
                });
            },
            put: (url, body, query) => {
                return new Promise((resolve, reject) => {
                    try {
                        chai.request(server).put(AccountSetup.addParameters(url, query))
                            .set('Authorization', `Bearer ${this.token}`)
                            .set('Content-Type', 'application/json')
                            .set('Accept', 'application/json')
                            .send(body)
                            .end((err, res) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(res);
                                }
                            });
                    } catch (e) {
                        reject(e)
                    }
                });
            },
            remove: (url, query) => {
                return new Promise((resolve, reject) => {
                    try {
                        chai.request(server).delete(AccountSetup.addParameters(url, query))
                            .set('Authorization', `Bearer ${this.token}`)
                            .end((err, res) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(res);
                                }
                            });
                    } catch (e) {
                        reject(e);
                    }
                });
            }
        },
        account: this.account
    }
};

AccountSetup.prototype.createAccount = function (options) {
    options = options || AccountSetup.defaultOptions();
    return new Promise((resolve, reject) => {
        chai.request(server)
            .post('/auth/register')
            .send(options.account)
            .end((err, res) => {
                if (!err) {
                    expect(res.statusCode).to.eql(201);
                    expect(res.body.token).to.not.be.null;
                    expect(res.body.account).to.not.be.null;
                    expect(res.body.account.username).to.eql(options.account.username.toLowerCase());
                    expect(res.body.account.email).to.eql(options.account.email.toLowerCase());
                    expect(res.body.profile).to.not.be.null;
                    expect(res.body.profile.accountId).to.eql(res.body.account._id);
                    this.profile = res.body.profile;
                    this.token = res.body.token;
                    this.account = res.body.account;
                    resolve(this.getContext());
                } else {
                    reject();
                }
            });
    })
};

AccountSetup.prototype.removeAccount = function () {
    if (this.account) {
        return mongoHelpers.findAccount({ username: this.account.username.toLowerCase() }).then((act) => {
            if (act) {
                return mongoHelpers.removeAccount({ username: this.account.username.toLowerCase() });
            } else {
                return Promise.resolve();
            }
        })
            .then(() => {
                return mongoHelpers.findProfile({ username: this.account.username.toLowerCase() }).then((profile) => {
                    if (profile) {
                        return mongoHelpers.removeProfile({ username: this.account.username.toLowerCase() });
                    } else {
                        return Promise.resolve();
                    }
                });
            });
    }
    return Promise.reject();
};

module.exports = AccountSetup;

