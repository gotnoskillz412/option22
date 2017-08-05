'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;

const server = require('../../src/app');

chai.use(chaiHttp);

describe('Index Tests', function () {
    describe('Base Endpoint', () => {
        it('should test the happy path', (done) => {
            chai.request(server)
                .get('/')
                .end((err, res) => {
                    if (err) {
                        done(err);
                    }
                    expect(res.statusCode).to.eql(200);
                    expect(res.body.ok).to.eql(true);
                    done();
                });
        });
    });
});