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
import { init, lock, pair, status, unlock, unpair } from '../index.js';

// To run an example just fill in the value of the constants and run the example.
const CONFIG = {
    appId: '<MY_APPID>',
    secretKey: '<MY_SECRETKEY>'
}

const readInput = (message) => {
    console.log(Array.isArray(message) ? message.join('\n') : message + ":");

    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
};

const showResponse = (msg, response) => {
    console.log(msg);
    console.log('##################');
    console.dir(response, { depth: null });
    console.log('##################');
}

const checkStatus = async (accountId, elementId) => {
    let response = await status(accountId)
    checkErrorResponse(response);
    if (response.data.operations[elementId].status == 'on') {
        console.log("Your latch is open and you are able to perform action");
    } else if (response.data.operations[elementId].status == 'off') {
        console.log("Your latch is lock and you can not be allowed to perform action");
    } else {
        console.log("Error processing  the response");
        process.exit(1);
    }
}

const checkErrorResponse = (response) => {
    if (response.error != null) {
        console.error(`Error in PAIR request with error_code: ${response.error.code} and message: ${response.error.message}`);
        process.exit(1)
    }
}

//Initialize configuration
init(CONFIG);

//Pairing process
let token = await readInput('Generated pairing token from the user account');
let commonName = await readInput('Do you want a alias for the pairing, it will be showed in admin panels like Latch Support Tool (L:ST). Optional, blank if none ') ?? null;

let response = await pair(token, null, null, commonName);
showResponse('Response pair', response);
checkErrorResponse(response);

console.log('Store the accountId for future uses');
let accountId = response.data.accountId;

//Check status account
//When the state is checked, it can be checked at different levels. Application, Operation or Instance
await checkStatus(accountId, CONFIG.appId)


//Lock the account
response = await lock(accountId)
checkErrorResponse(response);
//Lock and Unlock responses are empty if all is correct
await checkStatus(accountId, CONFIG.appId)


//Unlock the account
response = await unlock(accountId)
checkErrorResponse(response);
await checkStatus(accountId, CONFIG.appId)


//Unpairing process
response = unpair(accountId);
await checkStatus(accountId, CONFIG.appId)
