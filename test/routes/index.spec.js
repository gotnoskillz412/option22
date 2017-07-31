'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const express = require('express');
const sinon = require('sinon');

const server = require('../../src/app');

chai.use(chaiHttp);

describe('Crypto Tests', function () {
    beforeEach(() => {
        this.sandbox = new sinon.sandbox.create();
    });

    afterEach(() => {
        this.sandbox.restore();
    });

    describe('Base Endpoint', () => {
        it('should test the happy path', (done) => {
            chai.request(server)
                .get('/')
                .end((err, res) => {
                    expect(res.statusCode).to.eql(200);
                    expect(res.body.ok).to.eql(true);
                    done();
                });
        });
    });
});