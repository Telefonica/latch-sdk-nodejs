/*
 * Latch NodeJS SDK Example
 * Copyright (C) 2024 Telefonica Innovación Digital

 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.

 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

import { expect } from "chai";
import config from "../config.js";
import latch from "../index.js";

const NAME_OPERATION = 'OPERATION-TEST-VALIDATION'
const NAME_INSTANCE = 'INSTANCE-TEST-VALIDATION'
const NAME_TOTP = 'TOTP-TEST-VALIDATION'

//Create an app at latch.tu.com, with totp server and the a account not paired, and replace the values with your app
//Generate a code from the app for pairing a account before execute the texts
let appId = '';
let secretKey = '';
let email = ''
let code = '';

if (appId == '' || secretKey == '' || email == '' || code == '') throw new Error(`Exit tests. Please fill the appId, secretKey, email and code for pairing`);

let appValidConfig = { appId, secretKey };

describe("latch", function () {
    describe("#latch.init()", function () {
        it("should stop if the appId is missing", function () {
            var args = { secretKey: '1234' }

            expect(latch.init.bind(latch, args)).to.throw(Error);
            expect(latch.init.bind(latch, args)).to.throw(/specify both the appId and secretKey/);
        });

        it("should stop if the secretKey is missing", function () {
            var args = { appId: '1234' }

            expect(latch.init.bind(latch, args)).to.throw(Error);
            expect(latch.init.bind(latch, args)).to.throw(/specify both the appId and secretKey/);
        });

        it("should stop if the appId is not 20 chars", function () {
            var args = { appId: '1234', secretKey: '1234567890123456789012345678901234567890' }

            expect(latch.init.bind(latch, args)).to.throw(Error);
            expect(latch.init.bind(latch, args)).to.throw(/check your appId and secretKey/);
        });

        it("should stop if the secretKey is not 40 chars", function () {
            var args = { appId: '12345678901234567890', secretKey: '1234' }

            expect(latch.init.bind(latch, args)).to.throw(Error);
            expect(latch.init.bind(latch, args)).to.throw(/check your appId and secretKey/);
        });

        it("should parse the hostname into an URI object", function () {
            var args = { appId: '12345678901234567890', secretKey: '1234567890123456789012345678901234567890', hostname: 'https://latch.tu.com' }

            latch.init(args);
            expect(config.API_HOST.protocol).to.equal('https:');
            expect(config.API_HOST.hostname).to.equal('latch.tu.com');
        });

        it("should receive an API error", function (done) {
            var args = { appId: '12345678901234567890', secretKey: '1234567890123456789012345678901234567890' }

            latch.init(args);
            latch.status('1234', '', '', function (err, result) {
                expect(result).to.have.a.property('error').that.is.an('object');
                expect(result.error).to.have.a.property('code', 102);
                expect(result.error).to.have.a.property('message', 'Invalid application signature');
                done();
            });
        });

        describe("Latch API requests with valid config", function () {
            before(function () {
                latch.init(appValidConfig);
            })

            let accountId;
            let operationId;
            let instanceId;
            let totpId;

            describe("Latch API requests with valid config", function () {
                it("check pair", function (done) {
                    latch.pair(code, function (err, result) {
                        expect(result).to.have.a.property('data').that.is.an('object');
                        expect(result.data).to.have.a.property('accountId').that.is.an('string');
                        accountId = result.data.accountId;
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check create operation", function (done) {
                    latch.createOperation(appId, NAME_OPERATION, 'DISABLED', 'DISABLED', function (err, result) {
                        expect(result).to.have.a.property('data').that.is.an('object');
                        expect(result.data).to.have.a.property('operationId').that.is.an('string');
                        operationId = result.data.operationId;
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check status", function (done) {
                    latch.status(accountId, '', '', function (err, result) {
                        expect(result).to.have.a.property('data').that.is.an('object');
                        expect(result.data).to.have.a.property('operations').that.is.an('object');
                        expect(result.data.operations).to.have.a.property(appId).that.is.an('object');
                        expect(result.data.operations[appId]).to.have.a.property('status').that.is.an('string');
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check lock", function (done) {
                    latch.lock(accountId, undefined, function (err, result) {
                        expect(result).to.be.an('object').that.is.empty;
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check unlock", function (done) {
                    latch.unlock(accountId, undefined, function (err, result) {
                        expect(result).to.be.an('object').that.is.empty;
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check history", function (done) {
                    latch.history(accountId, undefined, undefined, function (err, result) {
                        expect(result).to.have.a.property('data').that.is.an('object');
                        expect(result.data).to.have.a.property('history').that.is.an('array');
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check operationStatus", function (done) {
                    latch.operationStatus(accountId, appId, undefined, undefined, function (err, result) {
                        expect(result).to.have.a.property('data').that.is.an('object');
                        expect(result.data).to.have.a.property('operations').that.is.an('object');
                        expect(result.data.operations).to.have.a.property(appId).that.is.an('object');
                        expect(result.data.operations[appId]).to.have.a.property('status').that.is.an('string');
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check getOperations", function (done) {
                    latch.getOperations(appId, function (err, result) {
                        expect(result).to.have.a.property('data').that.is.an('object');
                        expect(result.data).to.have.a.property('operations').that.is.an('object');
                        done();
                    });

                });
            });
            describe("Latch API requests with valid config", function () {
                it("check updateOperation", function (done) {
                    latch.updateOperation(operationId, NAME_OPERATION + '-update-1', undefined, undefined, function (err, result) {
                        expect(result).to.be.an('object').that.is.empty;
                        latch.updateOperation(operationId, NAME_OPERATION + '-update-2', 'MANDATORY', 'MANDATORY', function (err, result) {
                            expect(result).to.be.an('object').that.is.empty;
                            done();
                        });
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check create instance", function (done) {
                    latch.createInstance(NAME_INSTANCE, accountId, operationId, function (err, result) {
                        expect(result).to.have.a.property('data').that.is.an('object');
                        expect(result.data).to.have.a.property('instances').that.is.an('object');
                        instanceId = Object.entries(result.data.instances).find(([_, value]) => value == NAME_INSTANCE)[0];
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check getInstances", function (done) {
                    latch.getInstances(accountId, operationId, function (err, result) {
                        expect(result).to.have.a.property('data').that.is.an('object');
                        expect(result.data).to.have.a.property(instanceId).that.is.an('object');
                        expect(result.data[instanceId]).to.have.a.property('name', NAME_INSTANCE);
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check instanceStatus", function (done) {
                    latch.instanceStatus(instanceId, accountId, operationId, undefined, undefined, function (err, result) {
                        expect(result).to.have.a.property('data').that.is.an('object');
                        expect(result.data).to.have.a.property('operations').that.is.an('object');
                        expect(result.data.operations).to.have.a.property(instanceId).that.is.an('object');
                        expect(result.data.operations[instanceId]).to.have.a.property('status').that.is.an('string');
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check updateInstance", function (done) {
                    latch.updateInstance(instanceId, accountId, operationId, NAME_INSTANCE + '-update-1', undefined, undefined, function (err, result) {
                        expect(result).to.be.an('object').that.is.empty;
                        latch.updateInstance(instanceId, accountId, operationId, NAME_INSTANCE + '-update-1', 'MANDATORY', 'MANDATORY', function (err, result) {
                            expect(result).to.be.an('object').that.is.empty;
                            done();
                        });
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check delete instance", function (done) {
                    latch.deleteInstance(instanceId, accountId, operationId, function (err, result) {
                        expect(result).to.be.an('object').that.is.empty;
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check create totp", function (done) {
                    latch.createTotp(email, NAME_TOTP, function (err, result) {
                        expect(result).to.have.a.property('data').that.is.an('object');
                        expect(result.data).to.have.a.property('totpId').that.is.an('string');
                        totpId = result.data.totpId;
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check getTotp", function (done) {
                    latch.getTotp(totpId, function (err, result) {
                        expect(result).to.have.a.property('data').that.is.an('object');
                        expect(result.data).to.have.a.property('totpId', totpId);
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check validateTotp", function (done) {
                    latch.validateTotp(totpId, "123456", function (err, result) {
                        expect(result).to.have.a.property('error').that.is.an('object');
                        expect(result.error).to.have.a.property('code', 306);
                        expect(result.error).to.have.a.property('message', 'Invalid totp code');
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check delete totp", function (done) {
                    latch.deleteTotp(totpId, function (err, result) {
                        expect(result).to.be.an('object').that.is.empty;
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check checkControlStatus", function (done) {
                    latch.checkControlStatus("12345", function (err, result) {
                        expect(result).to.have.a.property('error').that.is.an('object');
                        expect(result.error).to.have.a.property('code', 1100);
                        expect(result.error).to.have.a.property('message', 'Authorization control not found');
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check delete operation", function (done) {
                    latch.deleteOperation(operationId, function (err, result) {
                        expect(result).to.be.an('object').that.is.empty;
                        done();
                    });
                });
            });
            describe("Latch API requests with valid config", function () {
                it("check unpair", function (done) {
                    latch.unpair(accountId, function (err, result) {
                        expect(result).to.be.an('object').that.is.empty;
                        done();
                    });
                });
            });
        });
    });
});