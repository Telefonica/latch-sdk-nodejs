
var crypto = require('crypto');
var http = require('https');
var config = require('./config');


var latch = {
    init: function(appId, secretKey) {
        config.appId = appId;
        config.secretKey = secretKey;
    },
    
    setHost: function(host) {
        config.API_HOST = host;
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

    var options = {
        hostname: config.API_HOST,
        port: config.API_PORT,
        path: queryString,
        method: HTTPMethod,
        headers: headers,
    };

    var latchResponse = '';
    var req = http.request(options, function(res) {
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
