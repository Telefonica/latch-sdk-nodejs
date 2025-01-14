### latch-sdk-nodejs ###


#### Prerequisites ####

* NodeJS.

* Read API documentation https://latch.tu.com/www/developers/doc_api

* To get the "Application ID" and "Secret", (fundamental values for integrating Latch in any application), it’s necessary to register a developer account in Latch's website: https://latch.tu.com. On the upper right side, click on "Developer area".


#### USING THE SDK IN NODEJS ####

* You need to include the npm package 'latch-sdk' in your package.json file and then require the "latch-sdk" in your NodeJS file.
```
    var latch = require('latch-sdk');
```

* Initialize latch with your AppId and SecretKey. Hostname and port are optional.
```
    latch.init({ appId: 'MY_APP_ID', secretKey: 'MY_SECRET_KEY', hostname: 'HOSTNAME:PORT' });
```

* Call to Latch Server. Pairing will return an account id that you should store for future api calls
```
    let PAIRING_CODE = "<PAIRING_CODE>"
    
    let response = latch.pair(PAIRING_CODE, function (err, result) {
        if (err) {
            console.log(util.inspect(err, {showHidden: true, depth: null, colors: true}));
        } else {
            console.log(util.inspect(result, {showHidden: true, depth: null, colors: true}));
        }
    });
```

#### USING THE SDK IN NODEJS FOR WEB3 SERVICES ####

For using the NodeJS SDK within an Web3 service, you must complain with the following:

* It is necessary to have a developer subscription that allows you to create web3 apps.
* You need metamask extension for Google Chrome [Download metamask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)
* You need a wallet to operate on Polygon. You can easily create one through Metamask.

### Creation of a WEB3 Latch app ###
[Creation of a WEB3 Latch app](doc/Latch_WEB3_Apps.pdf)

Once you have your developer Latch account created, you must logging in the website, and you see your application list (you could have it empty):

The two additional parameters are:
- WEB3WALLET: The Ethereum-based address wallet for the user that wants to pair the service.
- WEB3SIGNATURE: A proof-of-ownership signature of a constant, in order to verify that the user owns the private key of the wallet. You can use https://etherscan.io/verifiedSignatures# to sign the following message:
- MESSAGE TO SIGN : "Latch-Web3"

* Call to Latch Server for pairing as usual, but with the newly methods:
```
    let MY_APPID = "<MY_APPID>"
    let MY_SECRETKEY = "<MY_SECRETKEY>"
    
    let WEB3WALLET = "<WEB3WALLET>"
    let WEB3SIGNATURE = "<WEB3SIGNATURE>"
    let PAIRING_CODE = "<PAIRING_CODE>"
    
    latch.init({ appId: MY_APPID, secretKey: MY_SECRETKEY });
    
    let response = latch.pair(PAIRING_CODE, function (err, result) {
        if (err) {
            console.log(util.inspect(err, {showHidden: true, depth: null, colors: true}));
        } else {
            console.log(util.inspect(result, {showHidden: true, depth: null, colors: true}));
        }
    }, WEB3WALLET, WEB3SIGNATURE);
```

You have an example of use in the file [example](examples/example.js)
