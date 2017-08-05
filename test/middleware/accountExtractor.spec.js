'use strict';
const expect = require('chai').expect;
const mongoose = require('mongoose');
const sinon = require('sinon');

const accountExtractor = require('../../src/middleware/accountExtractor');
const mongoHelpers = require('../../src/helpers/mongoHelpers');

describe('Account Extractor Middleware', function () {
    let req;
    let res;
    let actExt;

    beforeEach(() => {
        req = {
            params: {
                accountId: 'success'
            }
        };
        res = {
            code: null,
            response: null,
            sent: null,
            json: (response) => {
                res.response = response;
            },
            status: (code) => {
                res.code = code;
                return {
                    json: res.json,
                    send: res.send
                };
            },
            send: () => {
                res.sent = true;
            }
        };
        actExt = accountExtractor();
        this.sandbox = sinon.sandbox.create()
    });
    afterEach(() => {
        this.sandbox.restore()
    });

    it('should test the happy path', (done) => {
        let nextCalled = false;
        const findAccountStub = this.sandbox.stub(mongoHelpers, 'findAccount').callsFake(() => {
            return {
                then: (cb) => {
                    cb({
                        _id: 'success'
                    });
                    return {
                        'catch': () => {
                            //do nothing
                        }
                    };
                }
            };
        });
        const mongooseStub = this.sandbox.stub(mongoose.Types.ObjectId, 'isValid').callsFake(() => {
            return true;
        });
        const next = () => {
            nextCalled = true;
        };
        actExt(req, res, next);
        expect(nextCalled).to.eql(true);
        expect(req.account._id).to.eql('success');
        expect(nextCalled).to.eql(true);
        expect(res.sent).to.be.null;
        expect(res.response).to.be.null;
        expect(res.code).to.be.null;
        expect(findAccountStub.calledOnce).to.eql(true);
        expect(mongooseStub.calledOnce).to.eql(true);
        done();
    });

    it('should test the happy path', (done) => {
        let nextCalled = false;
        const findAccountStub = this.sandbox.stub(mongoHelpers, 'findAccount').callsFake(() => {
            return {
                then: (cb) => {
                    cb({
                        _id: 'success'
                    });
                    return {
                        'catch': () => {
                            //do nothing
                        }
                    };
                }
            };
        });
        const mongooseStub = this.sandbox.stub(mongoose.Types.ObjectId, 'isValid').callsFake(() => {
            return true;
        });
        const next = () => {
            nextCalled = true;
        };
        actExt(req, res, next);
        expect(nextCalled).to.eql(true);
        expect(req.account._id).to.eql('success');
        expect(nextCalled).to.eql(true);
        expect(res.sent).to.be.null;
        expect(res.response).to.be.null;
        expect(res.code).to.be.null;
        expect(findAccountStub.calledOnce).to.eql(true);
        expect(mongooseStub.calledOnce).to.eql(true);
        done();
    });

    it('should test getting a 404 with an invalid ObjectId accountId', (done) => {
        actExt(req, res);
        expect(res.sent).to.eql(true);
        expect(res.code).to.eql(404);
        done();
    });

    it('should test getting a 404 from not finding an account', (done) => {
        const findAccountStub = this.sandbox.stub(mongoHelpers, 'findAccount').callsFake(() => {
            return {
                then: (cb) => {
                    cb(null);
                    return {
                        'catch': () => {
                            //do nothing
                        }
                    };
                }
            };
        });
        const mongooseStub = this.sandbox.stub(mongoose.Types.ObjectId, 'isValid').callsFake(() => {
            return true;
        });
        actExt(req, res);
        expect(res.sent).to.eql(true);
        expect(res.code).to.eql(404);
        expect(findAccountStub.calledOnce).to.eql(true);
        expect(mongooseStub.calledOnce).to.eql(true);
        done();
    });

    it('should test getting a 500 from an account find issue', (done) => {
        const findAccountStub = this.sandbox.stub(mongoHelpers, 'findAccount').callsFake(() => {
            return {
                then: () => {
                    return {
                        'catch': (errorCb) => {
                            errorCb();
                        }
                    };
                }
            };
        });
        const mongooseStub = this.sandbox.stub(mongoose.Types.ObjectId, 'isValid').callsFake(() => {
            return true;
        });
        actExt(req, res);
        expect(res.response.message).to.eql('Error finding account');
        expect(res.code).to.eql(500);
        expect(findAccountStub.calledOnce).to.eql(true);
        expect(mongooseStub.calledOnce).to.eql(true);
        done();
    });
});