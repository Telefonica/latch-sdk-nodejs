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
import { createInstance, createOperation, createTotp, deleteInstance, deleteOperation, deleteTotp, getInstances, getOperations, init, lock, LOCK_ON_REQUEST, pair, pairWithId, status, TWO_FACTOR, unlock, unpair, updateInstance, validateTotp } from '../index.js';

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

const checkStatus = (id, response) => {
    if (response.data.operations[id].status == 'on') {
        console.log("Your latch is open and you are able to perform action")
    } else if (response.data.operations[id].status == 'off') {
        console.log("Your latch is lock and you can not be allowed to perform action")
    } else {
        console.log("Error processing  the response")
    }
}

const warning = `
\x1b[41mIMPORTANT!!\x1b[0m
To run this example you need to get the "Application ID" and "Secret", (fundamental values for integrating Latch in any application).
It’s necessary to register a developer account in Latch's website: https://latch.tu.com. On the upper right side, click on "Developer area"`;

const menu = ["","",
    "--- Main Menu ---",
    "1. Pair a account with your app, token generated from user",
    "2. Pair a account with web3 services",
    "3. Pair a account with an alias",
    "4. Unpair a account with your app",
    "-----------------",
    "5. Create operation",
    "6. Lock operation",
    "7. Unlock operation",
    "8. Status operation",
    "9. Get operations",
    "10. Delete operation",
    "-----------------",
    "11. Create TOTP",
    "12. Validate TOTP",
    "13. Delete TOTP",
    "-----------------",
    "14. Create instance",
    "15. Update instance",
    "16. Status instance",
    "17. Get instances",
    "18. Delete instance",
    "Select an option: "
];

const menuTwoFactor = ["--- Two factor options ---",
    "1. Disabled",
    "2. Opt in",
    "3. Mandatory",
    "Select an option: "
];

const menuLockOnRequest = ["--- Lock on request options ---",
    "1. Disabled",
    "2. Opt in",
    "3. Mandatory",
    "Select an option: "
];

const readTwoFactor = async () => {
    let twoFactor = await readInput(menuTwoFactor);
    switch (twoFactor) {
        case '1': return TWO_FACTOR.DISABLED;
        case '2': return TWO_FACTOR.OPT_IN;
        case '3': return TWO_FACTOR.MANDATORY;
        default: return TWO_FACTOR.DISABLED;
    }
}

const readLockOnRequest = async () => {
    let twoFactor = await readInput(menuLockOnRequest);
    switch (twoFactor) {
        case '1': return LOCK_ON_REQUEST.DISABLED;
        case '2': return LOCK_ON_REQUEST.OPT_IN;
        case '3': return LOCK_ON_REQUEST.MANDATORY;
        default: return LOCK_ON_REQUEST.DISABLED;
    }
}

const handleOption = async (option) => {
    switch (option) {
        case '1': {
            let token = await readInput('Generated pairing token from the user account');
            let response = await pair(token);
            console.dir(response, { depth: null });
            console.log('Store the accountId for future uses');
            break;
        }
        case '2': {
            let token = await readInput('Generated pairing token from the user account');
            let web3Wallet = await readInput('Wallet');
            let web3Signature = await readInput('Signature');
            let response = await pair(token, web3Wallet, web3Signature);
            console.dir(response, { depth: null });
            console.log('Store the accountId for future uses');
            break;
        }
        case '3': {
            let token = await readInput('Generated pairing token from the user account');
            let commonName = await readInput('Alias attached to this pairing, for panel admins like Latch Support Tool');
            let response = await pair(token, undefined, undefined, commonName);
            console.dir(response, { depth: null });
            console.log('Store the accountId for future uses');
            break;
        }
        case '4': {
            let accountId = await readInput('The account identifier, from the pairing process');
            let response = await unpair(accountId);
            console.dir(response, { depth: null });
            break;
        }
        case '5': {
            let parentOperationId = await readInput('Parent operation id (application id if operation root)');
            let nameOperation = await readInput('Name operation');
            let twoFactor = await readTwoFactor();
            let lockOnRequest = await readLockOnRequest();
            let response = await createOperation(parentOperationId, nameOperation, twoFactor, lockOnRequest);
            console.dir(response, { depth: null });
            console.log('Store the operationId for future uses');
            break;
        }
        case '6': {
            let accountId = await readInput('The account identifier');
            let operationId = await readInput('The operation identifier');
            let response = await lock(accountId, operationId);
            console.dir(response, { depth: null });
            break;
        }
        case '7': {
            let accountId = await readInput('The account identifier');
            let operationId = await readInput('The operation identifier');
            let response = await unlock(accountId, operationId);
            console.dir(response, { depth: null });
            break;
        }
        case '8': {
            let accountId = await readInput('The account identifier');
            let operationId = await readInput('The operation identifier');
            let response = await status(accountId, operationId);
            console.dir(response, { depth: null });
            checkStatus(operationId, response);
            break;
        }
        case '9': {
            let operationId = await readInput('The operation identifier root (empty for all)');
            let response = await getOperations(operationId);
            console.dir(response, { depth: null });
            break;
        }
        case '10': {
            let operationId = await readInput('The operation identifier');
            let response = await deleteOperation(operationId);
            console.dir(response, { depth: null });
            break;
        }
        case '11': {
            let userId = await readInput('User identifier');
            let commonName = await readInput('Name for the Totp');
            let response = await createTotp(userId, commonName);
            console.dir(response, { depth: null });
            break;
        }
        case '12': {
            let totpId = await readInput('Totp Identifier');
            let code = await readInput('Code generated');
            let response = await validateTotp(totpId, code);
            console.dir(response, { depth: null });
            break;
        }
        case '13': {
            let totpId = await readInput('Totp Identifier');
            let response = await deleteTotp(totpId);
            console.dir(response, { depth: null });
            break;
        }
        case '14': {
            let nameInstance = await readInput('Name for the instance');
            let accountId = await readInput('Account identifier');
            let operationId = await readInput('Id operation (Optional, blank if none)');
            let response = await createInstance(nameInstance,accountId,operationId)
            console.dir(response, { depth: null });
            break;
        }
        case '15': {
            let instanceId = await readInput('Instance identifier');
            let accountId = await readInput('Account identifier');14
            let operationId = await readInput('Id operation (Optional, blank if none)');
            let nameInstance = await readInput('Name for the instance');
            let response = await updateInstance(instanceId, accountId, operationId, nameInstance);
            console.dir(response, { depth: null });
            break;
        }
        case '16': {
            let accountId = await readInput('Account identifier');
            let operationId = await readInput('Id operation (Optional, blank if none)');
            let instanceId = await readInput('Instance identifier');
            let isSilent = await readInput('Silent operation (true/false)');
            let isNoOtp = await readInput('No Otp (true/false)');
            let response = await status(accountId, operationId, instanceId, isSilent, isNoOtp);
            console.dir(response, { depth: null });
            checkStatus(instanceId, response);
            break;
        }
        case '17': {
            let accountId = await readInput('Account identifier');
            let operationId = await readInput('Id operation (Optional, blank if none)');
            let response = await getInstances(accountId, operationId);
            console.dir(response, { depth: null });
            break;
        }
        case '18': {
            let instanceId = await readInput('Instance identifier');
            let accountId = await readInput('Account identifier');
            let operationId = await readInput('Id operation (Optional, blank if none)');
            let response = await deleteInstance(instanceId, accountId, operationId);
            console.dir(response, { depth: null });
            break;
        }
        default:
            console.log("\nInvalid option. Please select a valid option");
    }
    mainMenu();
};

const mainMenu = async () => {
    let option = await readInput(menu);
    handleOption(option);
};

console.log(warning);
init(CONFIG);
mainMenu();