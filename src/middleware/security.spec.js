'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');

const cache = require('../services/cache');
const jwt = require('jsonwebtoken');

const security = require('./security');

describe('Security Middleware', () => {
    let req;
    let res;
    let sec;

    beforeEach(() => {
        req = {
            headers: {
                authorization: null
            }
        };
        res = {
            code: null,
            response: null,
            json: (response) => {
                res.response = response;
            },
            status: (code) => {
                res.code = code;
                return {
                    json: res.json
                }
            }
        };
        sec = security();
        this.sandbox = sinon.sandbox.create()
    });
    afterEach(() => {
        this.sandbox.restore()
    });

    it('should test for a 401 with no toke', (done) => {
        sec(req, res);
        expect(res.code).to.eql(401, `Expected ${res.code} to be 401`);
        expect(res.response).to.not.be.null;
        done();
    });

    it('should test for a 401 with old token', (done) => {
        req.headers.authorization = 'Bearer test';
        const cacheGetStub = this.sandbox.stub(cache, 'get').callsFake((key, cb) => {
            cb(null, 'found');
        });

        sec(req, res);
        expect(cacheGetStub.calledOnce).to.eql(true, 'Expected cacheGetStub to be called once');
        expect(res.code).to.eql(401, `Expected ${res.code} to be 401`);
        expect(res.response).to.not.be.null;
        done();
    });

    it('should test for a 500 with a bad cache check', (done) => {
        req.headers.authorization = 'Bearer test';
        const cacheGetStub = this.sandbox.stub(cache, 'get').callsFake((key, cb) => {
            cb('err', null);
        });

        sec(req, res);
        expect(cacheGetStub.calledOnce).to.eql(true, 'Expected cacheGetStub to be called once');
        expect(res.code).to.eql(500, `Expected ${res.code} to be 500`);
        expect(res.response).to.not.be.null;
        done();
    });

    it('should test for a 401 with an unauthorized token', (done) => {
        req.headers.authorization = 'Bearer test';
        const cacheGetStub = this.sandbox.stub(cache, 'get').callsFake((key, cb) => {
            cb(null, null);
        });

        const jwtVerifyStub = this.sandbox.stub(jwt, 'verify').callsFake((token, secret, cb) => {
            cb('fail', null);
        });
        sec(req, res);
        expect(cacheGetStub.calledOnce).to.eql(true, 'Expected cacheGetStub to be called once');
        expect(jwtVerifyStub.calledOnce).to.eql(true, 'Expected jwtVerifyStub to be called once');
        expect(res.code).to.eql(401, `Expected ${res.code} to be 401`);
        expect(res.response).to.not.be.null;
        done();
    });

    it('should test for a 401 with an unauthorized token', (done) => {
        req.headers.authorization = 'Bearer test';

        let nextCalled = false;
        const next = () => {
            nextCalled = true;
        };
        const cacheGetStub = this.sandbox.stub(cache, 'get').callsFake((key, cb) => {
            cb(null, null);
        });

        const jwtVerifyStub = this.sandbox.stub(jwt, 'verify').callsFake((token, secret, cb) => {
            cb(null, 'success');
        });
        sec(req, res, next);
        expect(cacheGetStub.calledOnce).to.eql(true, 'Expected cacheGetStub to be called once');
        expect(jwtVerifyStub.calledOnce).to.eql(true, 'Expected jwtVerifyStub to be called once');
        expect(req.decoded).to.eql('success', `Expected ${req.decoded} to be 'success'`);
        expect(nextCalled).to.eql(true, `Expected ${nextCalled} to be true`);
        done();
    });
});