
const https = require('https');
const fs = require('fs');

//
//Databox ENV vars
//
let CM_HTTPS_CA_ROOT_CERT = '';
try {
    CM_HTTPS_CA_ROOT_CERT = fs.readFileSync('/run/secrets/DATABOX_ROOT_CA')
} catch (e) {
    CM_HTTPS_CA_ROOT_CERT = '';
}
//
// An https.Agent to trust the CM https cert if one is provided
//
var agentOptions = {};
if(CM_HTTPS_CA_ROOT_CERT === '') {
    console.log("WARNING[databox-request]:: no https root cert provided not checking https certs.");
    agentOptions.rejectUnauthorized = false;
} else {
    agentOptions.ca = CM_HTTPS_CA_ROOT_CERT;
}

var httpsAgent = new https.Agent(agentOptions);

module.exports = httpsAgent;