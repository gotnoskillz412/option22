'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');

const cryptoLib = require('crypto');

const crypto = require('../../src/services/crypto');

describe('Crypto Tests', function () {
    beforeEach(() => {
        this.sandbox = new sinon.sandbox.create();
    });

    afterEach(() => {
        this.sandbox.restore();
    });

    it('should test the generateSalt method', (done) => {
        let password = null;
        let testSalt = [];
        const SALT_LENGTH = 32;
        for (let i = 0; i < SALT_LENGTH; i++) {
            testSalt.push(0);
        }
        const randomBytesStub = this.sandbox.stub(cryptoLib, 'randomBytes').callsFake((length) => {
            return new Uint8Array(length);
        });

        const createHmacStub = this.sandbox.stub(cryptoLib, 'createHmac').callsFake(() => {
            return {
                digest: () => {
                    return 'hash_success';
                },
                update: (pw) => {
                    password = pw;
                }
            };
        });

        const result = crypto.generateSaltAndHash('test_password');
        const test = testSalt.toString('hex').slice(SALT_LENGTH);
        expect(result.salt).to.eql(test, `Expected ${result} to be '${test}'`);
        expect(result.hash).to.eql('hash_success', `Expected ${result} to be 'hash_success'`);
        expect(randomBytesStub.calledOnce).to.eql(true, 'Expected randomBytesStub to be called once');
        expect(createHmacStub.calledOnce).to.eql(true, 'Expected createHmacStub to be called once');
        expect(password).to.eql('test_password', `Expected ${password} to be 'test_password`);
        done();
    });

    it('should test the verifyPassword method', (done) => {
        let password = null;
        const createHmacStub = this.sandbox.stub(cryptoLib, 'createHmac').callsFake(() => {
            return {
                digest: () => {
                    return 'hash_success';
                },
                update: (pw) => {
                    password = pw;
                }
            };
        });

        const result = crypto.verifyPassword('test_password', 'test', 'hash_success');
        expect(result).to.eql(true, `Expected ${result} to be true`);
        expect(createHmacStub.calledOnce).to.eql(true, `Expected createHmacStub to be called once`);
        expect(password).to.eql('test_password', `Expected ${password} to be 'test_password`);
        done();
    });
});