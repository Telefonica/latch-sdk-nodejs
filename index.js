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

 "use strict";

var crypto = require('crypto')
  , url = require('url')
  , https = require('https')
  , http = require('http')
  , config = require('./config');

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
        _http("GET", config.API_PAIR_WITH_ID_URL + "/" + accountId, '', '', next);
    },

    pair: function(token, next) {
        _http("GET", config.API_PAIR_URL + "/" + token, '', '', next);
    },

    status: function(accountId, next) {
        _http("GET", config.API_CHECK_STATUS_URL + "/" + accountId, '', '', next);
    },

    operationStatus: function(accountId, operationId, next) {
        _http("GET", config.API_CHECK_STATUS_URL + "/" + accountId + "/op/" + operationId, '', '', next);
    },

    unpair: function(accountId, next) {
        _http("GET", config.API_UNPAIR_URL + "/" + accountId, '', '', next);
    },
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

var _http = function(HTTPMethod, queryString, xHeaders, utc, next) {
    xHeaders = xHeaders || '';
    utc = utc || dateFormat(new Date (), config.UTC_STRING_FORMAT, true);

    var stringToSign = (HTTPMethod.toUpperCase().trim() + "\n" +
                    utc + "\n" +
                    xHeaders + "\n" +
                    queryString.trim());

    var authorizationHeader = config.AUTHORIZATION_METHOD + config.AUTHORIZATION_HEADER_FIELD_SEPARATOR +
                           config.appId + config.AUTHORIZATION_HEADER_FIELD_SEPARATOR + signData(stringToSign);

    var headers = {};
    headers[config.AUTHORIZATION_HEADER_NAME] = authorizationHeader;
    headers[config.DATE_HEADER_NAME] = utc;

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

    req.end();
};