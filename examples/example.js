/*
 * Latch NodeJS SDK Example
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

var latch = require('../index.js');

latch.init({ appId: 'MY_APPID', secretKey: 'MY_SECRETKEY' });
var response = latch.status('MY_ACCOUNTID', function(err, result) {
    if (err) {
        console.log(util.inspect(err, { showHidden: true, depth: null, colors:true }));
    } else {
        console.log(util.inspect(result, { showHidden: true, depth: null, colors: true }));
    }
});


/* // PAIR EXAMPLE WITH WEB3
let MY_ACCOUNTID = "<MY_ACCOUNTID>"
let MY_APPID = "<MY_APPID>"
let MY_SECRETKEY = "<MY_SECRETKEY>"

let WEB3WALLET = "<WEB3WALLET>"
let WEB3SIGNATURE = "<WEB3SIGNATURE>"

latch.init({ appId: MY_APPID, secretKey: MY_SECRETKEY });

latch.pairWithId(MY_ACCOUNTID, function(err, data) {
    if (data["data"]["accountId"]) {
        console.log(data["data"]["accountId"]);
    } else if (data["error"]) {
        console.log("Error");
    }
}, WEB3WALLET, WEB3SIGNATURE);


// PAIR EXAMPLE WITH WEB3 USING PAIRING_CODE
let MY_APPID = "<MY_APPID>"
let MY_SECRETKEY = "<MY_SECRETKEY>"

let WEB3WALLET = "<WEB3WALLET>"
let WEB3SIGNATURE = "<WEB3SIGNATURE>"
let PAIRING_CODE = "<PAIRING_CODE>"

latch.init({ appId: MY_APPID, secretKey: MY_SECRETKEY });

latch.pair(PAIRING_CODE, function(err, data) {
    if (data["data"]["accountId"]) {
        console.log(data["data"]["accountId"]);
    } else if (data["error"]) {
        console.log("Error");
    }
}, WEB3WALLET, WEB3SIGNATURE);
 */
