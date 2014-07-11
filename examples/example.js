var latch = require('../index.js');

latch.init(YOUR_APPID, YOUR_SECRETKEY);
var response = latch.status(YOUR_ACCOUNT_ID, function(data) {
    console.log(data);
});
