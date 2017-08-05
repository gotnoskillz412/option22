'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const mailer = require('../../node_modules/nodemailer/lib/mailer/index');
const sinon = require('sinon');

const server = require('../../src/app');

chai.use(chaiHttp);

describe('Email Tests', function () {
    beforeEach(() => {
        this.sandbox = new sinon.sandbox.create();
    });

    afterEach(() => {
        this.sandbox.restore();
    });

    describe('Send Email Endpoint', () => {
        it('should test the happy path', (done) => {
            this.sandbox.stub(mailer.prototype, 'sendMail').callsFake((opts, cb) => {
                cb();
            });
            chai.request(server)
                .post('/email')
                .send({
                    email: 'test@test.com',
                    name: 'test_name',
                    subject: 'test_subject',
                    message: 'test_message'
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    }
                    expect(res.statusCode).to.eql(201);
                    expect(res.body.message).to.eql('Email sent successfully');
                    done();
                });
        });

        it('should test 400 response with invalid body format', (done) => {
            chai.request(server)
                .post('/email')
                .send({
                    email: 'test@test.com',
                    name: 'test_name',
                    subject: 'test_subject'
                })
                .end((err, res) => { // eslint-disable-line handle-callback-err
                    expect(res.statusCode).to.eql(400);
                    expect(res.body.message).to.eql('Invalid email format');
                    done();
                });
        });

        it('should test 500 response with error from nodemailer', (done) => {
            this.sandbox.stub(mailer.prototype, 'sendMail').callsFake((opts, cb) => {
                cb('error');
            });
            chai.request(server)
                .post('/email')
                .send({
                    email: 'test@test.com',
                    name: 'test_name',
                    subject: 'test_subject',
                    message: 'test_message'
                })
                .end((err, res) => { // eslint-disable-line handle-callback-err
                    expect(res.statusCode).to.eql(500);
                    expect(res.body.message).to.eql('Unable to send email at this time.');
                    done();
                });
        });
    });
});