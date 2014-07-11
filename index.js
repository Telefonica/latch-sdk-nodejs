/*
Latch NodeJS SDK
Copyright (C) 2014 Eleven Paths

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
*/

var crypto = require('crypto')
  , url = require('url')
  , https = require('https')
  , http = require('http')
  , config = require('./config')

var latch = {
    init: function(appId, secretKey) {
        config.appId = appId;
        config.secretKey = secretKey;
    },
    
    setHost: function(host) {
        config.API_HOST = host;
    },
    
    setPort: function(port) {
        config.API_PORT = port;
    },
    
    pairWithId: function(accountId, cb) {
        _http("GET", config.API_PAIR_WITH_ID_URL + "/" + accountId, '', '', cb);
    },

    pair: function(token, cb) {
        _http("GET", config.API_PAIR_URL + "/" + token, '', '', cb);
    },

    status: function(accountId, cb) {
        _http("GET", config.API_CHECK_STATUS_URL + "/" + accountId, '', '', cb);
    },

    operationStatus: function(accountId, operationId, cb) {
        _http("GET", config.API_CHECK_STATUS_URL + "/" + accountId + "/op/" + operationId, '', '', cb);
    },

    unpair: function(accountId, cb) {
        _http("GET", config.API_UNPAIR_URL + "/" + accountId, '', '', cb);
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
}

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
}

var _http = function(HTTPMethod, queryString, xHeaders, utc, cb) {
    xHeaders = xHeaders || '';
    utc = utc || dateFormat(new Date (), config.UTC_STRING_FORMAT, true);

    var stringToSign = (HTTPMethod.toUpperCase().trim() + "\n" + 
                    utc + "\n" + 
                    xHeaders + "\n" +
                    queryString.trim());
       
    var authorizationHeader = config.AUTHORIZATION_METHOD + config.AUTHORIZATION_HEADER_FIELD_SEPARATOR + 
                           config.appId + config.AUTHORIZATION_HEADER_FIELD_SEPARATOR + signData(stringToSign);

    var headers = {}
    headers[config.AUTHORIZATION_HEADER_NAME] = authorizationHeader;
    headers[config.DATE_HEADER_NAME] = utc;
    
    var latch_hostname = url.parse(config.API_HOST);
    var httprequest;
    if (latch_hostname.protocol == 'http:') {
        httprequest = http;
    } else if (latch_hostname.protocol == 'https:'){
        httprequest = https;
    }

    var options = {
        hostname: latch_hostname.hostname,
        port: config.API_PORT,
        path: queryString,
        method: HTTPMethod,
        headers: headers,
    };

    var latchResponse = '';

    var req = httprequest.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            latchResponse += chunk;
        });
        res.on('end', function() {
           cb(JSON.parse(latchResponse));
        });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    req.end();
}