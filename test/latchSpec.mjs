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
import { config } from "../config.js";
import { createOperation, createTotp, deleteOperation, deleteTotp, getOperations, init, lock, LOCK_ON_REQUEST, operationStatus, pair, pairWithId, TWO_FACTOR, unlock, unpair, validateTotp, status, history, updateOperation, createInstance, deleteInstance, getInstances, instanceStatus, updateInstance, getTotp, checkControlStatus } from '../index.js';
import { describe, it, before } from "mocha";

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

describe("Latch", function () {
    describe("Set app config", function () {
        it("should stop if the appId is missing", async function () {
            let appConfig = { secretKey: '1234' }

            expect(() => init(appConfig)).to.throw(Error);
            expect(() => init(appConfig)).to.throw(/specify both the appId and secretKey/);
        });

        it("should stop if the secretKey is missing", async function () {
            let appConfig = { appId: '1234' }

            expect(() => init(appConfig)).to.throw(Error);
            expect(() => init(appConfig)).to.throw(/specify both the appId and secretKey/);
        });

        it("should stop if the appId is not 20 chars", async function () {
            let appConfig = { appId: '1234', secretKey: '1234567890123456789012345678901234567890' }

            expect(() => init(appConfig)).to.throw(Error);
            expect(() => init(appConfig)).to.throw(/check your appId and secretKey/);
        });

        it("should stop if the secretKey is not 40 chars", async function () {
            let appConfig = { appId: '12345678901234567890', secretKey: '1234' }

            expect(() => init(appConfig)).to.throw(Error);
            expect(() => init(appConfig)).to.throw(/check your appId and secretKey/);
        });

        it("should parse the hostname into an URI object", async function () {
            let appConfig = { appId: '12345678901234567890', secretKey: '1234567890123456789012345678901234567890', hostname: 'https://latch.tu.com' }

            init(appConfig);
            expect(config.API_HOST.protocol).to.equal('https:');
            expect(config.API_HOST.hostname).to.equal('latch.tu.com');
        });

        it("should receive an API error", async function () {
            let appConfig = { appId: '12345678901234567890', secretKey: '1234567890123456789012345678901234567890' };
            init(appConfig);
            let response = await status('1234');
            expect(response).to.have.a.property('error').that.is.an('object');
            expect(response.error).to.have.a.property('code', 102);
            expect(response.error).to.have.a.property('message', 'Invalid application signature');
        });
    });

    describe("Latch API requests with valid config", function () {
        before(function() {
            init(appValidConfig);
        })

        let accountId;
        let operationId;
        let instanceId;
        let totpId;

        it("check pair", async function () {
            let responsePair = await pair(code);
            expect(responsePair).to.have.a.property('data').that.is.an('object');
            expect(responsePair.data).to.have.a.property('accountId').that.is.an('string');
            accountId = responsePair.data.accountId;
        });

        it("check create operation", async function () {
            let responseCreateOperation = await createOperation(appId, NAME_OPERATION, TWO_FACTOR.DISABLED, LOCK_ON_REQUEST.DISABLED);
            expect(responseCreateOperation).to.have.a.property('data').that.is.an('object');
            expect(responseCreateOperation.data).to.have.a.property('operationId').that.is.an('string');
            operationId = responseCreateOperation.data.operationId;
        });

        it("check status", async function () {
            let response = await status(accountId);
            expect(response).to.have.a.property('data').that.is.an('object');
            expect(response.data).to.have.a.property('operations').that.is.an('object');
            expect(response.data.operations).to.have.a.property(appId).that.is.an('object');
            expect(response.data.operations[appId]).to.have.a.property('status').that.is.an('string');
        });

        it("check lock", async function () {
            let response = await lock(accountId);
            expect(response).to.be.an('object').that.is.empty;
        });

        it("check unlock", async function () {
            let response = await unlock(accountId);
            expect(response).to.be.an('object').that.is.empty;
        });

        it("check history", async function () {
            let response = await history(accountId);
            expect(response).to.have.a.property('data').that.is.an('object');
            expect(response.data).to.have.a.property('history').that.is.an('array');
        });

        it("check operationStatus", async function () {
            let response = await operationStatus(accountId, appId);
            expect(response).to.have.a.property('data').that.is.an('object');
            expect(response.data).to.have.a.property('operations').that.is.an('object');
            expect(response.data.operations).to.have.a.property(appId).that.is.an('object');
            expect(response.data.operations[appId]).to.have.a.property('status').that.is.an('string');
        });

        it("check getOperations", async function () {
            let response = await getOperations(appId);
            expect(response).to.have.a.property('data').that.is.an('object');
            expect(response.data).to.have.a.property('operations').that.is.an('object');

        });

        it("check updateOperation", async function () {
            let response = await updateOperation(operationId, 'test');
            expect(response).to.be.an('object').that.is.empty;
            response = await updateOperation(operationId, 'test', TWO_FACTOR.MANDATORY, LOCK_ON_REQUEST.MANDATORY);
            expect(response).to.be.an('object').that.is.empty;
        });

        it("check create instance", async function () {
            let responseCreateInstance = await createInstance(NAME_INSTANCE, accountId, operationId);
            expect(responseCreateInstance).to.have.a.property('data').that.is.an('object');
            expect(responseCreateInstance.data).to.have.a.property('instances').that.is.an('object');
            instanceId = Object.entries(responseCreateInstance.data.instances).find(([_, value]) => value == NAME_INSTANCE)[0];
        });

        it("check getInstances", async function () {
            let response = await getInstances(accountId, operationId);
            expect(response).to.have.a.property('data').that.is.an('object');
            expect(response.data).to.have.a.property(instanceId).that.is.an('object');
            expect(response.data[instanceId]).to.have.a.property('name',NAME_INSTANCE);
        });

        it("check instanceStatus", async function () {
            let response = await instanceStatus(instanceId, accountId, operationId);
            expect(response).to.have.a.property('data').that.is.an('object');
            expect(response.data).to.have.a.property('operations').that.is.an('object');
            expect(response.data.operations).to.have.a.property(instanceId).that.is.an('object');
            expect(response.data.operations[instanceId]).to.have.a.property('status').that.is.an('string');
        });

        it("check updateInstance", async function () {
            let response = await updateInstance(instanceId, accountId, operationId, 'instace-testUpdate');            
            expect(response).to.be.an('object').that.is.empty;
            response = await updateInstance(instanceId, accountId, operationId, 'instace-testUpdate', TWO_FACTOR.MANDATORY, LOCK_ON_REQUEST.MANDATORY);
            expect(response).to.be.an('object').that.is.empty;
        });

        it("check delete instance", async function () {
            let responseDeleteInstance = await deleteInstance(instanceId, accountId,operationId)
            expect(responseDeleteInstance).to.be.an('object').that.is.empty;
        });

        it("check create totp", async function () {
            let responseCreateTotp = await createTotp(email, NAME_TOTP);
            expect(responseCreateTotp).to.have.a.property('data').that.is.an('object');
            expect(responseCreateTotp.data).to.have.a.property('totpId').that.is.an('string');
            totpId = responseCreateTotp.data.totpId;
        });

        it("check getTotp", async function () {
            let response = await getTotp(totpId);
            expect(response).to.have.a.property('data').that.is.an('object');
            expect(response.data).to.have.a.property('totpId',totpId);
        });

        it("check validateTotp", async function () {
            let response = await validateTotp(totpId, "123456");
            expect(response).to.have.a.property('error').that.is.an('object');
            expect(response.error).to.have.a.property('code', 306);
            expect(response.error).to.have.a.property('message', 'Invalid totp code');
        });

        it("check delete totp", async function () {
            let responseDeleteTotp = await deleteTotp(totpId, accountId)
            expect(responseDeleteTotp).to.be.null;
        });

        it("check checkControlStatus", async function () {
            let response = await checkControlStatus("12345");
            expect(response).to.have.a.property('error').that.is.an('object');
            expect(response.error).to.have.a.property('code', 1100);
            expect(response.error).to.have.a.property('message', 'Authorization control not found');
        });

        it("check delete operation", async function () {
            let responseDeleteOperation = await deleteOperation(operationId);
            expect(responseDeleteOperation).to.be.an('object').that.is.empty;
        });

        it("check unpair", async function () {
            let responseUnpair = await unpair(accountId);
            expect(responseUnpair).to.be.an('object').that.is.empty;
        });
    });
});