/*
 * Latch NodeJS SDK
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

import { config } from './config.js';
import { http, addParamOptional, addUriOptionalOption, addUriOptionalParam, addUriOptionalPath } from './helper.js';

/**
 * `LatchError`
 *
 * @typedef  {Object} LatchError
 * @property {Object} code A numeric value used to identify the error
 * @property {Object} message Description of the type of error
 */

/**
 * Promise `LatchResponse`
 *
 * @typedef  {Object} LatchResponse 
 * @property {LatchError} error Message if error
 * @property {Object} data Message if ok
 */


/**
 * Options initialize
 *
 * @typedef {Object} Options
 * @property {string} appId Id application
 * @property {string} secretKey Secret key
 * @property {string} [hostname] URI Latch service
 */

/**
 * @typedef {string} TwoFactor
 **/

/**
 * Enum for Two factor values.
 * @readonly
 * @enum {TwoFactor}
 */
export const TWO_FACTOR = {
    DISABLED: 'DISABLED',
    OPT_IN: 'OPT_IN',
    MANDATORY: 'MANDATORY'
}

/**
 * @typedef {string} LockOnRequest
 **/

/**
 * Enum for Lock on request values.
 * @readonly
 * @enum {LockOnRequest}
 */
export const LOCK_ON_REQUEST = {
    DISABLED: 'DISABLED',
    OPT_IN: 'OPT_IN',
    MANDATORY: 'MANDATORY'
}

/**
 * Configure the Application ID and secret obtained from latch.tu.com
 * @param {Options} options 
 */
export const init = (options) => {
    if (!('appId' in options) || (!('secretKey' in options))) {
        throw (new Error('You need to specify both the appId and secretKey'));
    }

    if ((options.appId.length != 20) || (options.secretKey.length != 40)) {
        throw (new Error('Please check your appId and secretKey, they seem to be wrong'));
    }

    config.APP_ID = options.appId;
    config.SECRET_KEY = options.secretKey;
    if ('hostname' in options) {
        config.API_HOST = new URL(options.hostname);
    } else {
        config.API_HOST = new URL(config.API_HOST);
    }
}

/**
 * Pairs the origin provider with a user account (mail).
 * @param {string} id The user identified (email)
 * @param {string} [web3Wallet] Wallet identificador
 * @param {string} [web3Signature] Wallet signature
 * @param {string} [commonName] Name attached to this pairing. Showed in admin panels.
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const pairWithId = (id, web3Wallet, web3Signature, commonName) => {
    let method = 'GET';
    let params = {};
    if ((web3Wallet ?? '' !== '') && (web3Signature ?? '' !== '')) {
        method = 'POST';
        params = { ...params, wallet: web3Wallet, signature: web3Signature };
    }
    if (commonName ?? '' !== '') {
        method = 'POST';
        params = { ...params, commonName };
    }
    return http(method, `${config.API_PAIR_WITH_ID_URL}/${id}`, params);
}

/**
 * Pairs the token provider with a user account.
 *
 * @param {string} token
 * @param {string} [web3Wallet] Wallet identificador
 * @param {string} [web3Signature] Wallet signature
 * @param {string} [commonName] Name attached to this pairing. Showed in admin panels.
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const pair = (token, web3Wallet, web3Signature, commonName) => {
    let method = 'GET';
    let params = {};
    if ((web3Wallet ?? '' !== '') && (web3Signature ?? '' !== '')) {
        method = 'POST';
        params = { ...params, wallet: web3Wallet, signature: web3Signature };
    }
    if (commonName ?? '' !== '') {
        method = 'POST';
        params = { ...params, commonName };
    }
    return http(method, `${config.API_PAIR_URL}/${token}`, params);
}

/**
 * Unpairs the origin provider with a user account.
 * @param {string} accountId The account identified
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const unpair = (accountId) => {
    return http('GET', `${config.API_UNPAIR_URL}/${accountId}`);
}

/**
 * Locks the operation
 * @param {string} accountId The account identifier
 * @param {string} operationId The operation identifier
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const lock = (accountId, operationId) => {
    var url = `${config.API_LOCK_URL}/${accountId}`;
    url = addUriOptionalParam(url, 'op', operationId);
    return http('POST', url);
}

/**
 * Unlocks the operation
 * @param {string} accountId The account identifier
 * @param {string} operationId The operation identifier
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const unlock = (accountId, operationId) => {
    var url = `${config.API_UNLOCK_URL}/${accountId}`;
    url = addUriOptionalParam(url, 'op', operationId);
    return http('POST', url);
}

/**
 * Get history status
 * @param {string} accountId The account identifier
 * @param {number} [fromTime] From in epoch format
 * @param {number} [toTime] To in epoch format
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const history = (accountId, fromTime = 0, toTime = new Date().getTime()) => {
    return http('GET', `${config.API_HISTORY_URL}/${accountId}/${String(fromTime)}/${String(toTime)}`);
}

/**
 * Add a new operation
 * @param {string} parentId identifies the parent of the operation to be created
 * @param {string} name The name of the operation
 * @param {TwoFactor} [twoFactor] Specifies if the Two Factor protection is enabled for this operation
 * @param {LockOnRequest} [lockOnRequest] Specifies if the 'Lock latches on status request' feature is disabled, opt-in or mandatory for this operation
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const createOperation = (parentId, name, twoFactor, lockOnRequest) => {
    var params = { parentId, name };
    params = addParamOptional(params, 'two_factor', twoFactor);
    params = addParamOptional(params, 'lock_on_request', lockOnRequest);
    return http("PUT", config.API_OPERATION_URL, params);
}

/**
 * Update an operation
 * @param {string} operationId The operation identifier
 * @param {string} name The name of the operation
 * @param {TwoFactor} [twoFactor] Specifies if the Two Factor protection is enabled for this operation
 * @param {LockOnRequest} [lockOnRequest] Specifies if the 'Lock latches on status request' feature is disabled, opt-in or mandatory for this operation
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const updateOperation = (operationId, name, twoFactor, lockOnRequest) => {
    var params = { name: name };
    params = addParamOptional(params, 'two_factor', twoFactor);
    params = addParamOptional(params, 'lock_on_request', lockOnRequest);
    return http('POST', `${config.API_OPERATION_URL}/${operationId}`, params);
}

/**
 * Remove an operation
 * @param {string} operationId The operation identifier
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const deleteOperation = (operationId) => {
    return http("DELETE", `${config.API_OPERATION_URL}/${operationId}`);
}

/**
 * Get information about the operation
 * @param {string} operationId The operation identifier
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const getOperations = (operationId) => {
    var url = config.API_OPERATION_URL;
    url = addUriOptionalPath(url, operationId);
    return http('GET', url);
}

/**
 * Retrieve instances for a given alias
 * @param {string} accountId The account identifier
 * @param {string} [operationId] The operation identifier(Optional) If retrieving instances for an operation instead of application
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const getInstances = (accountId, operationId) => {
    var url = `${config.API_INSTANCE_URL}/${accountId}`;
    url = addUriOptionalParam(url, 'op', operationId);
    return http('GET', url);
}

/**
 * Retrieve status for a given account/operation/instance
 * @param {string} accountId The account identifier
 * @param {string} [operationId] The operation identifier
 * @param {string} [instanceId] The instance identifier
 * @param {boolean} [silent=false] True for not sending lock/unlock push notifications to the mobile devices, false otherwise 
 * @param {boolean} [nootp=false] True for not generating a OTP if needed
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const status = (accountId, operationId, instanceId, silent = false, nootp = false) => {
    var url = `${config.API_CHECK_STATUS_URL}/${accountId}`;
    url = addUriOptionalParam(url, 'op', operationId);
    url = addUriOptionalParam(url, 'i', instanceId);
    url = addUriOptionalOption(url, 'nootp', nootp);
    url = addUriOptionalOption(url, 'silent', silent);
    return http('GET', url);
}

/**
 * Create a instance
 * @param {string} name The name for the instace
 * @param {string} accountId The account identifier
 * @param {string} [operationId] The operation identifier
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const createInstance = (name, accountId, operationId) => {
    var params = { instances: name };
    var url = `${config.API_INSTANCE_URL}/${accountId}`;
    url = addUriOptionalParam(url, 'op', operationId);
    return http("PUT", url, params);
}

/**
 * Update the instance
 * @param {string} instanceId The instance identifier
 * @param {string} accountId The account identifier
 * @param {string} [operationId] The operation identifier
 * @param {string} name 
 * @param {TwoFactor} [twoFactor] Specifies if the Two Factor protection is enabled for this application
 * @param {LockOnRequest} [lockOnRequest] Specifies if the 'Lock latches on status request' feature is disabled, opt-in or mandatory for this operation
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const updateInstance = (instanceId, accountId, operationId, name, twoFactor, lockOnRequest) => {
    var params = { name };
    params = addParamOptional(params, 'two_factor', twoFactor);
    params = addParamOptional(params, 'lock_on_request', lockOnRequest);
    var url = `${config.API_INSTANCE_URL}/${accountId}`;
    url = addUriOptionalParam(url, 'op', operationId);
    url = addUriOptionalParam(url, 'i', instanceId);
    return http('POST', url, params);
}

/**
 * Remove the instance
 * @param {string} instanceId The instance identifier 
 * @param {string} accountId The account identifier
 * @param {string} [operationId] The operation identifier
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const deleteInstance = (instanceId, accountId, operationId) => {
    var url = config.API_INSTANCE_URL + "/" + accountId;
    url = addUriOptionalParam(url, 'op', operationId);
    url = addUriOptionalParam(url, 'i', instanceId);
    return http("DELETE", url);
}

/**
 * Create a Time-based one-time password
 * @param {string} id User identifier (mail)
 * @param {string} name Name for the Totp
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const createTotp = (id, name) => {
    let params = { userId: id, commonName: name };
    let url = config.API_TOTP_URL;
    return http('POST', url, params);
}

/**
 * Get data information about the totp
 * @param {string} totpId Totp Identifier
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const getTotp = (totpId) => {
    let url = `${config.API_TOTP_URL}/${totpId}`
    return http('GET', url);
}

/**
 * Validate a code from a totp
 * @param {string} totpId Totp Identifier
 * @param {string} code Code generated
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const validateTotp = (totpId, code) => {
    let params = { code };
    let url = `${config.API_TOTP_URL}/${totpId}/validate`
    return http('POST', url, params);
}

/**
 * Remove a totp
 * @param {string} totpId Totp Identifier
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const deleteTotp = (totpId) => {
    let url = `${config.API_TOTP_URL}/${totpId}`
    return http("DELETE", url);
}

/**
 * Check operation status
 * @param {string} controlId 
 * @returns {Promise<LatchResponse>} A promise with the response
 */
export const checkControlStatus = (controlId) => {
    let url = `${config.API_CONTROL_STATUS_CHECK_URL}/${controlId}`
    return http('GET', url);
}