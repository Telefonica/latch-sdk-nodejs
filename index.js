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

var crypto = require('crypto');
var https = require('https');
var http = require('http');
var url = require('url');
var config = require('./config');

var latch = {
    /**
     * Callback `next`
     *
     * @callback next 
     * @param {Object} error Message if error
     * @param {Object} data Message if ok
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
    TWO_FACTOR : {
        DISABLED: 'DISABLED',
        OPT_IN: 'OPT_IN',
        MANDATORY: 'MANDATORY'
    },

    /**
     * @typedef {string} LockOnRequest
     **/

    /**
     * Enum for Lock on request values.
     * @readonly
     * @enum {LockOnRequest}
     */
    LOCK_ON_REQUEST:  {
        DISABLED: 'DISABLED',
        OPT_IN: 'OPT_IN',
        MANDATORY: 'MANDATORY'
    },

    /**
     * Configure the Application ID and secret obtained from latch.tu.com
     * @param {Options} options 
     */
    init: function (options) {
        if (!('appId' in options) || (!('secretKey' in options))) {
            throw (new Error('You need to specify both the appId and secretKey'));
        }

        if ((options.appId.length != 20) || (options.secretKey.length != 40)) {
            throw (new Error('Please check your appId and secretKey, they seem to be wrong'));
        }

        config.appId = options.appId;
        config.secretKey = options.secretKey;
        if ('hostname' in options) {
            config.API_HOST = url.parse(options.hostname);
        } else {
            config.API_HOST = url.parse(config.API_HOST);
        }
    },

    /**
     * Pairs the origin provider with a user account (mail).
     * @param {string} id The user identified (email)
     * @param {next} next The callback that handles the response
     * @param {string} [web3Wallet] Wallet identificador
     * @param {string} [web3Signature] Wallet signature
     */
    pairWithId: function (accountId, next, web3Wallet, web3Signature, commonName) {
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
        return _http(method, config.API_PAIR_WITH_ID_URL + "/" + accountId, params, '', '', next);
    },

    /**
     * Pairs the token provider with a user account.
     *
     * @param {string} token
     * @param {next} next The callback that handles the response
     * @param {string} [web3Wallet] Wallet identificador
     * @param {string} [web3Signature] Wallet signature
     */
    pair: function (token, next, web3Wallet, web3Signature, commonName) {
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
        return _http(method, config.API_PAIR_URL + "/" + token, params, '', '', next);
    },

    /**
     * Return application status for a given accountId
     * @param {string} accountId The accountId which status is going to be retrieved
     * @param {string} [silent=''] Something for not sending lock/unlock push notifications to the mobile devices, empty string otherwise
     * @param {string} [nootp=''] Something for not generating a OTP if needed
     * @param {next} next The callback that handles the response
     */
    status: function (accountId, silent, nootp, next) {
        var url = config.API_CHECK_STATUS_URL + "/" + accountId;
        if (nootp != null) {
            url += '/nootp'
        }
        if (silent != null) {
            url += '/silent';
        }
        _http("GET", url, '', '', '', next);
    },

    /**
     * Return operation status for a given accountId
     * @param {string} accountId The user identified (email) 
     * @param {string} operationId The operation identifier
     * @param {string} [silent=''] Something for not sending lock/unlock push notifications to the mobile devices, empty string otherwise 
     * @param {string} [nootp=''] Something for not generating a OTP if needed
     * @param {next} next The callback that handles the response
     */
    operationStatus: function (accountId, operationId, silent, nootp, next) {
        var url = config.API_CHECK_STATUS_URL + "/" + accountId + "/op/" + operationId;
        if (nootp != null) {
            url += '/nootp'
        }
        if (silent != null) {
            url += '/silent';
        }
        _http("GET", url, '', '', '', next);
    },

    /**
     * Unpairs the origin provider with a user account.
     * @param {string} accountId The account identified
     * @param {next} next The callback that handles the response
     */
    unpair: function (accountId, next) {
        _http("GET", config.API_UNPAIR_URL + "/" + accountId, '', '', '', next);
    },

    /**
     * Locks the operation
     * @param {string} accountId The user identified (email) 
     * @param {string} operationId The operation identifier
     * @param {next} next The callback that handles the response
     */
    lock: function (accountId, operationId, next) {
        var url = config.API_LOCK_URL + "/" + accountId;
        if (operationId != null) {
            url += "/op/" + operationId
        }
        _http("POST", url, '', '', '', next);
    },

    /**
     * Unlocks the operation
     * @param {string} accountId The user identified (email) 
     * @param {string} operationId The operation identifier
     * @param {next} next The callback that handles the response
     */
    unlock: function (accountId, operationId, next) {
        var url = config.API_UNLOCK_URL + "/" + accountId;
        if (operationId != null) {
            url += "/op/" + operationId
        }
        _http("POST", url, '', '', '', next);
    },

    /**
     * Get history status
     * @param {string} accountId The user identified (email) 
     * @param {number} [fromTime] From in epoch format
     * @param {number} [toTime] To in epoch format
     * @param {next} next The callback that handles the response
     */
    history: function (accountId, fromTime, toTime, next) {
        if (toTime == '') {
            toTime = int(round(time.time() * 1000))
        }
        _http("GET", config.API_HISTORY_URL + "/" + accountId + "/" + String(fromTime) + "/" + String(toTime), '', '', '', next);
    },

    /**
     * Add a new operation
     * @param {string} parentId identifies the parent of the operation to be created
     * @param {string} name The name of the operation
     * @param {TwoFactor} [twoFactor] Specifies if the Two Factor protection is enabled for this operation
     * @param {LockOnRequest} [lockOnRequest] Specifies if the 'Lock latches on status request' feature is disabled, opt-in or mandatory for this operation
     * @param {next} next The callback that handles the response
     */
    createOperation: function (parentId, name, twoFactor, lockOnRequest, next) {
        var params = { parentId: parentId, name: name };
        if (twoFactor != null) {
            params.two_factor = twoFactor
        }
        if (lockOnRequest != null) {
            params.lock_on_request = lockOnRequest
        }
        _http("PUT", config.API_OPERATION_URL, params, '', '', next);
    },

    /**
     * 
     * @param {string} operationId The operation identifier
     * @param {string} name The name of the operation
     * @param {TwoFactor} [twoFactor] Specifies if the Two Factor protection is enabled for this operation
     * @param {LockOnRequest} [lockOnRequest] Specifies if the 'Lock latches on status request' feature is disabled, opt-in or mandatory for this operation
     * @param {next} next The callback that handles the response
     */
    updateOperation: function (operationId, name, twoFactor, lockOnRequest, next) {
        var params = { name: name };
        if (twoFactor != null) {
            params.two_factor = twoFactor
        }
        if (lockOnRequest != null) {
            params.lock_on_request = lockOnRequest
        }
        _http("POST", config.API_OPERATION_URL + "/" + operationId, params, '', '', next);
    },

    /**
     * Remove a operation
     * @param {string} operationId The operation identifier
     * @param {next} next The callback that handles the response
     */
    deleteOperation: function (operationId, next) {
        _http("DELETE", config.API_OPERATION_URL + "/" + operationId, '', '', '', next);
    },

    /**
     * Get information about the operation
     * @param {string} operationId The operation identifier
     * @param {next} next The callback that handles the response
     */
    getOperations: function (operationId, next) {
        var url = config.API_OPERATION_URL;
        if (operationId != null) {
            url += "/" + operationId;
        }
        _http("GET", url, '', '', '', next);
    },

    /**
     * Retrieve instances for a given alias
     * @param {string} accountId The user identified (email) 
     * @param {string} [operationId] The operation identifier(Optional) If retrieving instances for an operation instead of application
     * @param {next} next The callback that handles the response
     */
    getInstances: function (accountId, operationId, next) {
        var url = config.API_INSTANCE_URL + "/" + accountId;
        if (operationId != null) {
            url += "/op/" + operationId;
        }
        _http("GET", url, '', '', '', next);
    },

    /**
     * Retrieve status for a given instance from a alias
     * @param {string} instanceId The instance identifier
     * @param {string} accountId The user identified (email) 
     * @param {string} [operationId] The operation identifier
     * @param {string} [silent=''] Something for not sending lock/unlock push notifications to the mobile devices, empty string otherwise 
     * @param {string} [nootp=''] Something for not generating a OTP if needed
     * @param {next} next The callback that handles the response
     */
    instanceStatus: function (instanceId, accountId, operationId, silent, nootp, next) {
        var url = config.API_CHECK_STATUS_URL + "/" + accountId;
        if (operationId != null) {
            url += "/op/" + operationId;
        }
        url += "/i/" + instanceId;
        if (nootp != null) {
            url += '/nootp'
        }
        if (silent != null) {
            url += '/silent';
        }
        _http("GET", url, '', '', '', next);
    },

    /**
     * Create a instance
     * @param {string} name The name for the instace
     * @param {string} accountId The user identified (email) 
     * @param {string} [operationId] The operation identifier
     * @param {next} next The callback that handles the response
     */
    createInstance: function (name, accountId, operationId, next) {
        var params = { instances: name };
        var url = config.API_INSTANCE_URL + "/" + accountId;
        if (operationId != null) {
            url += "/op/" + operationId;
        }
        _http("PUT", url, params, '', '', next);
    },

    /**
     * Update the instance
     * @param {string} instanceId The instance identifier
     * @param {string} accountId The user identified (email) 
     * @param {string} [operationId] The operation identifier
     * @param {string} name 
     * @param {TwoFactor} [twoFactor] Specifies if the Two Factor protection is enabled for this application
     * @param {LockOnRequest} [lockOnRequest] Specifies if the 'Lock latches on status request' feature is disabled, opt-in or mandatory for this operation
     * @param {next} next The callback that handles the response
     */
    updateInstance: function (instanceId, accountId, operationId, name, twoFactor, lockOnRequest, next) {
        var params = { name: name };
        if (twoFactor != null) {
            params.two_factor = twoFactor
        }
        if (lockOnRequest != null) {
            params.lock_on_request = lockOnRequest
        }
        var url = config.API_INSTANCE_URL + "/" + accountId;
        if (operationId != null) {
            url += "/op/" + operationId;
        }
        url += "/i/" + instanceId;
        _http("POST", url, params, '', '', next);
    },

    /**
     * Remove the instance
     * @param {string} instanceId The instance identifier 
     * @param {string} accountId The user identified (email) 
     * @param {string} [operationId] The operation identifier
     * @param {next} next The callback that handles the response
     */
    deleteInstance: function (instanceId, accountId, operationId, next) {
        var url = config.API_INSTANCE_URL + "/" + accountId;
        if (operationId != null) {
            url += "/op/" + operationId;
        }
        url += "/i/" + instanceId;
        _http("DELETE", url, '', '', '', next);
    },

    /**
     * Create a Time-based one-time password
     * @param {string} id User identifier (mail)
     * @param {string} name Name for the Totp
     * @param {next} next The callback that handles the response
     */
    createTotp: function (userId, commonName, next) {
        let params = { userId, commonName };
        let url = config.API_TOTP_URL;
        _http("POST", url, params, '', '', next);
    },

    /**
     * Get data information about the totp
     * @param {string} totpId Totp Identifier
     * @param {next} next The callback that handles the response
     */
    getTotp: function (totpId, next) {
        let url = `${config.API_TOTP_URL}/${totpId}`
        _http("GET", url, '', '', '', next);
    },

    /**
     * Validate a code from a totp
     * @param {string} totpId Totp Identifier
     * @param {string} code Code generated
     * @param {next} next The callback that handles the response
     */
    validateTotp: function (totpId, code, next) {
        let params = { code };
        let url = `${config.API_TOTP_URL}/${totpId}/validate`
        _http("POST", url, params, '', '', next);
    },

    /**
     * Remove a totp
     * @param {string} totpId Totp Identifier
     * @param {next} next The callback that handles the response
     */
    deleteTotp: function (totpId, next) {
        let url = `${config.API_TOTP_URL}/${totpId}`
        _http("DELETE", url, '', '', '', next);
    },

    /**
     * Check operation status
     * @param {string} controlId 
     * @param {next} next The callback that handles the response
     */
    checkControlStatus: function (controlId, next) {
        let url = `${config.API_CONTROL_STATUS_CHECK_URL}/${controlId}`
        _http("GET", url, '', '', '', next);
    }
};

module.exports = latch;

var signData = function (data) {
    if (data) {
        var hmac = crypto.createHmac('sha1', config.secretKey);
        hmac.setEncoding('base64');
        hmac.write(data);
        hmac.end();
        return hmac.read();
    } else {
        return '';
    }
};

var dateFormat = function (date, fstr, utc) {
    utc = utc ? 'getUTC' : 'get';
    return fstr.replace(/%[YmdHMS]/g, function (m) {
        switch (m) {
            case '%Y': return date[utc + 'FullYear'](); // no leading zeros required
            case '%m': m = 1 + date[utc + 'Month'](); break;
            case '%d': m = date[utc + 'Date'](); break;
            case '%H': m = date[utc + 'Hours'](); break;
            case '%M': m = date[utc + 'Minutes'](); break;
            case '%S': m = date[utc + 'Seconds'](); break;
            default: return m.slice(1); // unknown code, remove %
        }
        // add leading zero if required
        return ('0' + m).slice(-2);
    });
};

var _http = function (HTTPMethod, queryString, params, xHeaders, utc, next) {
    xHeaders = xHeaders || '';
    utc = utc || dateFormat(new Date(), config.UTC_STRING_FORMAT, true);

    var stringToSign = (HTTPMethod.toUpperCase().trim() + "\n" +
        utc + "\n" +
        xHeaders + "\n" +
        queryString.trim());

    if (params != '') {
        var serialized_params = "";

        var sortable = [];
        for (var key in params) {
            sortable.push([key, params[key]]);
        }
        sortable.sort();

        for (var key in sortable) {
            if (serialized_params != "") {
                serialized_params += "&";
            }
            serialized_params += sortable[key][0] + "=" + encodeURIComponent(sortable[key][1]);
        }

        stringToSign += "\n" + serialized_params;
    }

    var authorizationHeader = config.AUTHORIZATION_METHOD + config.AUTHORIZATION_HEADER_FIELD_SEPARATOR +
        config.appId + config.AUTHORIZATION_HEADER_FIELD_SEPARATOR + signData(stringToSign);

    var headers = {};
    headers[config.AUTHORIZATION_HEADER_NAME] = authorizationHeader;
    headers[config.DATE_HEADER_NAME] = utc;
    headers[config.PLUGIN_HEADER_NAME] = "Nodejs";

    if (HTTPMethod == "POST" || HTTPMethod == "PUT")
        headers['Content-Type'] = 'application/x-www-form-urlencoded';

    var options = {
        'hostname': config.API_HOST.hostname,
        'port': config.API_HOST.port,
        'path': queryString,
        'method': HTTPMethod,
        'headers': headers,
        'protocol': config.API_HOST.protocol
    };

    var latchResponse = '';

    var req = (options.protocol == 'http:' ? http : https).request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            latchResponse += chunk;
        });
        res.on('end', function () {
            var jsonresponse;

            try {
                jsonresponse = JSON.parse(latchResponse);
            } catch (e) {
                next(new Error('problem with JSON parse: ' + e.message));
            }

            next(null, jsonresponse);
        });

        if (res.statusCode === 204) {
            next(null, {});
        }
    });

    req.on('error', function (e) {
        next(new Error('problem with request: ' + e.message));
    });

    // post the data
    if (HTTPMethod == "POST" || HTTPMethod == "PUT") {
        if (params != '') {
            req.write(serialized_params);
        }
    }


    req.end();
};