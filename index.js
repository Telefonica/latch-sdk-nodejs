/*
 * Latch NodeJS SDK
 * Copyright (C) 2014 Eleven Paths

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
    init: function(options) {
        if (!('appId' in options) || (!('secretKey' in options))) {
            throw(new Error('You need to specify both the appId and secretKey'));
        }

        if ((options.appId.length != 20) || (options.secretKey.length != 40)) {
            throw(new Error('Please check your appId and secretKey, they seem to be wrong'));
        }

        config.appId = options.appId;
        config.secretKey = options.secretKey;
        if ('hostname' in options) {
            config.API_HOST = url.parse(options.hostname);
        } else {
            config.API_HOST = url.parse(config.API_HOST);
        }
    },

    pairWithId: function(accountId, next) {
        _http("GET", config.API_PAIR_WITH_ID_URL + "/" + accountId, '', '', '', next);
    },

    pair: function(token, next) {
        _http("GET", config.API_PAIR_URL + "/" + token, '', '', '', next);
    },

    status: function(accountId, next) {
        var url = config.API_CHECK_STATUS_URL + "/" + accountId;
        if (nootp != ''){
            url += '/nootp'
        }
        if (silent != ''){
            url += '/silent';
        }
        _http("GET", url, '', '', '', next);
    },

    operationStatus: function(accountId, operationId, next) {
        var url = config.API_CHECK_STATUS_URL + "/" + accountId + "/op/" + operationId;
        if (nootp != ''){
            url += '/nootp'
        }
        if (silent != ''){
            url += '/silent';
        }
        _http("GET", url, '', '', '', next);
    },

    unpair: function(accountId, next) {
        _http("GET", config.API_UNPAIR_URL + "/" + accountId, '', '', '', next);
    },

    lock: function(accountId, operationId, next) {
        if (operationId == '') {
            _http("POST", config.API_LOCK_URL + "/" + accountId, '', '', '', next);
        } else{
            _http("POST", config.API_LOCK_URL + "/" + accountId + "/op/" + operationId, '', '', '', next);
        }
    },

    unlock: function(accountId, operationId, next) {
        if (operationId == '') {
            _http("POST", config.API_UNLOCK_URL + "/" + accountId, '', '', '', next);
        } else{
            _http("POST", config.API_UNLOCK_URL + "/" + accountId + "/op/" + operationId, '', '', '', next);
        }
    },

    history: function(accountId, fromTime, toTime) {
        if (toTime == '') {
            toTime = int(round(time.time() * 1000))
        }
        _http("GET", self.API_HISTORY_URL + "/" + accountId + "/" + String(fromTime) + "/" + String(toTime), '', '', '', next);
    },

    createOperation: function(parentId, name, twoFactor, lockOnRequest) {
        var params = {parentId: parentId, name: name, two_factor: twoFactor, lock_on_request: lockOnRequest};
        _http("PUT", self.API_OPERATION_URL, params, '', '', next);
    },

    updateOperation: function(operationId, name, twoFactor, lockOnRequest) {
        var params = {name: name, two_factor: twoFactor, lock_on_request: lockOnRequest};
        _http("POST", self.API_OPERATION_URL + "/" + operationId, params, '', '', next);
    },

    deleteOperation: function(operationId) {
        _http("DELETE", self.API_OPERATION_URL + "/" + operationId, '', '', '', next);
    },

    getOperations: function(operationId) {
        if (operationId == '') {
            _http("GET", self.API_OPERATION_URL, '', '', '', next);
        } else{
            _http("GET", self.API_OPERATION_URL + "/" + operationId, '', '', '', next);
        }
    },

    getInstances: function(accountId, operationId, next) {
        if (operationId == '') {
            _http("GET", config.API_INSTANCE_URL + "/" + accountId, '', '', '', next);
        } else {
            _http("GET", config.API_INSTANCE_URL + "/" + accountId + "/op/" + operationId , '', '', '', next);
        }
    },

    instanceStatus: function(instanceId, accountId, operationId, silent, nootp, next) {
        var url = '';
        if (operationId == '') {
            url = config.API_CHECK_STATUS_URL + "/" + accountId + "/i/" + instanceId;
        } else {
            url = config.API_CHECK_STATUS_URL + "/" + accountId + "/op/" + operationId + "/i/" + instanceId;
        }
        if (nootp != ''){
            url += '/nootp'
        }
        if (silent != ''){
            url += '/silent';
        }
        _http("GET", url, '', '', '', next);
    },

    createInstance: function(name, accountId, operationId, next) {
        var params = {instances: name};
        if (operationId == '') {
            _http("PUT", config.API_INSTANCE_URL + "/" + accountId, params, '', '', next);
        } else {
            _http("PUT", config.API_INSTANCE_URL + "/" + accountId + '/op/' + operationId, params, '', '', next);
        }
    },

    updateInstance: function(instanceId, accountId, operationId, name, twoFactor, lockOnRequest, next) {
        var params = {name: name, two_factor: twoFactor, lock_on_request: lockOnRequest};
        if (operationId == '') {
            _http("POST", config.API_INSTANCE_URL + "/" + accountId + '/i/' + instanceId, params, '', '', next);
        } else {
            _http("POST", config.API_INSTANCE_URL + "/" + accountId + '/op/' + operationId + '/i/' + instanceId, params, '', '', next);
        }
    },

    deleteInstance: function(instanceId, accountId, operationId, next) {
        if (operationId == '') {
            _http("DELETE", config.API_INSTANCE_URL + "/" + accountId + '/i/' + instanceId, '', '', '', next);
        } else {
            _http("DELETE", config.API_INSTANCE_URL + "/" + accountId + '/op/' + operationId + '/i/' + instanceId, '', '', '', next);
        }
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
  return fstr.replace (/%[YmdHMS]/g, function (m) {
    switch (m) {
    case '%Y': return date[utc + 'FullYear'] (); // no leading zeros required
    case '%m': m = 1 + date[utc + 'Month'] (); break;
    case '%d': m = date[utc + 'Date'] (); break;
    case '%H': m = date[utc + 'Hours'] (); break;
    case '%M': m = date[utc + 'Minutes'] (); break;
    case '%S': m = date[utc + 'Seconds'] (); break;
    default: return m.slice (1); // unknown code, remove %
    }
    // add leading zero if required
    return ('0' + m).slice (-2);
  });
};

var _http = function(HTTPMethod, queryString, params, xHeaders, utc, next) {
    xHeaders = xHeaders || '';
    utc = utc || dateFormat(new Date (), config.UTC_STRING_FORMAT, true);

    var stringToSign = (HTTPMethod.toUpperCase().trim() + "\n" +
                    utc + "\n" +
                    xHeaders + "\n" +
                    queryString.trim());

    if (params != '') {
        var serialized_params = "";
        //TODO: Sort params!!?
        for (var key in params) {
            serialized_params += key + "=" + encodeURI(params[key]);
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
        'port':     config.API_HOST.port,
        'path':     queryString,
        'method':   HTTPMethod,
        'headers':  headers,
        'protocol': config.API_HOST.protocol
    };

    var latchResponse = '';

    var req = (options.protocol == 'http:' ? http : https).request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            latchResponse += chunk;
        });
        res.on('end', function() {
            var jsonresponse;

            try {
                jsonresponse = JSON.parse(latchResponse);
            } catch (e) {
                next(new Error('problem with JSON parse: ' + e.message));
            }

            next(null, jsonresponse);
        });
    });

    req.on('error', function(e) {
        next(new Error('problem with request: ' + e.message));
    });

    // post the data
    if (HTTPMethod == "POST" || HTTPMethod == "PUT")
    //if (params != None)
    //        parameters = urllib.urlencode(params)
    req.write(serialized_params);

    req.end();
};