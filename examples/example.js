/*
 * Latch NodeJS SDK Example
 * Copyright (C) 2023 Telefonica Digital

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


// To run an example just fill in the value of the constants and run the example.

const latch = require('../index.js');
const util = require('util');


// Mandatory
const MY_APPID = "<MY_APPID>";
const MY_SECRETKEY = "<MY_SECRETKEY>";

// Mandatory depending on the method
const MY_ACCOUNTID = "<MY_ACCOUNTID>"
const MY_ACCOUNT_NAME = "<MY_ACCOUNT_NAME>"
const PAIRING_CODE = "<PAIRING_CODE>"
const OPERATIONID = "<OPERATIONID>"

// Mandatory for web3
const WEB3WALLET = "<WEB3WALLET>"
const WEB3SIGNATURE = "<WEB3SIGNATURE>"

latch.init({ appId: MY_APPID, secretKey: MY_SECRETKEY });


// USING THE SDK IN NODEJS

// PAIR WITH ID (FOR TESTING)
function example_pair_with_id() {
    let response = latch.pairWithId(MY_ACCOUNT_NAME, function(err, result) {
        if (err) {
            console.log(util.inspect(err, { showHidden: true, depth: null, colors:true }));
        } else {
            console.log(util.inspect(result, { showHidden: true, depth: null, colors: true }));
        }
    });
}

// PAIR WITH PAIRING CODE
function example_pair_with_paring_code() {
    let response = latch.pair(PAIRING_CODE, function (err, result) {
        if (err) {
            console.log(util.inspect(err, {showHidden: true, depth: null, colors: true}));
        } else {
            console.log(util.inspect(result, {showHidden: true, depth: null, colors: true}));
        }
    });
}


// USING THE SDK IN NODEJS FOR WEB3 SERVICES

// PAIR WITH ID (WEB3)
function example_pair_with_id_web3() {
    let response = latch.pairWithId(MY_ACCOUNT_NAME, function (err, result) {
        if (err) {
            console.log(util.inspect(err, {showHidden: true, depth: null, colors: true}));
        } else {
            console.log(util.inspect(result, {showHidden: true, depth: null, colors: true}));
        }
    }, WEB3WALLET, WEB3SIGNATURE);
}

// PAIR WITH PAIRING CODE (WEB3)
function example_pair_with_paring_code_web3() {
    let response = latch.pair(PAIRING_CODE, function (err, result) {
        if (err) {
            console.log(util.inspect(err, {showHidden: true, depth: null, colors: true}));
        } else {
            console.log(util.inspect(result, {showHidden: true, depth: null, colors: true}));
        }
    }, WEB3WALLET, WEB3SIGNATURE);
}

// USING THE SDK IN NODEJS FOR ALL (WEB3 AND NOT WEB3)

// GET STATUS
function example_get_status() {
    let response = latch.status(MY_ACCOUNTID, null, null, function (err, result) {
        if (err) {
            console.log(util.inspect(err, {showHidden: true, depth: null, colors: true}));
        } else {
            console.log(util.inspect(result, {showHidden: true, depth: null, colors: true}));
        }
    });
}

function example_get_status_operation() {

    operationStatus = latch.operationStatus(MY_ACCOUNTID, OPERATIONID, null, null, function (err, result) {
        if (err) {
            console.log(util.inspect(err, {showHidden: true, depth: null, colors: true}));
        } else {
            console.log(util.inspect(result, {showHidden: true, depth: null, colors: true}));
        }
    });
}


// LOCK STATUS
function example_lock() {
    let response = latch.lock(MY_ACCOUNTID, null, function (err, result) {
        if (err) {
            console.log(util.inspect(err, {showHidden: true, depth: null, colors: true}));
        } else {
            console.log(util.inspect(result, {showHidden: true, depth: null, colors: true}));
        }
    });
}

// UNLOCK STATUS
function example_unlock() {
    let response = latch.unlock(MY_ACCOUNTID, null, function (err, result) {
        if (err) {
            console.log(util.inspect(err, {showHidden: true, depth: null, colors: true}));
        } else {
            console.log(util.inspect(result, {showHidden: true, depth: null, colors: true}));
        }
    });
}

// LOCK FOR OPERATION
function example_lock_for_operation() {
    let response = latch.lock(MY_ACCOUNTID, OPERATIONID, function (err, result) {
        if (err) {
            console.log(util.inspect(err, {showHidden: true, depth: null, colors: true}));
        } else {
            console.log(util.inspect(result, {showHidden: true, depth: null, colors: true}));
        }
    });
}

// UNLOCK FOR OPERATION
function example_unlock_for_operation() {
    let response = latch.unlock(MY_ACCOUNTID, OPERATIONID, function (err, result) {
        if (err) {
            console.log(util.inspect(err, {showHidden: true, depth: null, colors: true}));
        } else {
            console.log(util.inspect(result, {showHidden: true, depth: null, colors: true}));
        }
    });
}

// UNPAIR
function example_unpair() {
    let response = latch.unpair(MY_ACCOUNTID, function (err, result) {
        if (err) {
            console.log(util.inspect(err, {showHidden: true, depth: null, colors: true}));
        } else {
            console.log(util.inspect(result, {showHidden: true, depth: null, colors: true}));
        }
    });
}


// TO RUN EXAMPLE
//example_pair_with_id_web3()
//example_get_status()
//example_get_status_operation()
//example_lock()
//example_lock_for_operation()
//example_unlock()
//example_unlock_for_operation()
//example_unpair()
