var Client = require('node-rest-client').Client;
var client = new Client();
const uri = 'http://ec2-34-220-162-82.us-west-2.compute.amazonaws.com:5002';
const username = 'PL19-11';
const pwd = 'polit0';
var settings    = require('../settings.json');

const syncClient = require('sync-rest-client');

//TEST THE RESPONSES!!!

//get configuration
function getConfig(token, _function) {
    const myuri = uri + '/user/PL19-11/devices';
    let args = {
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "JWT " + token
        }
    };
    client.get(myuri, args, _function)
}

//update configuration
function postConfig(data,response) {
    const myuri = uri + '/user/PL19-11/devices';

    let args = {
        data: {"device_mac":settings.mac, "nickname": settings.nickname, "configuration":settings},
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "JWT " + data.access_token
        }
    };
    client.post(myuri, args,_postConfig)
}

function _postConfig(data, response){
    console.log("POST CONFIG ended correctly")
}



//request for authentication-->response=token
function authenticate(_function) {
    const myuri = uri + '/auth';
    let args = {
        data : {"username":username, "password":pwd},
        headers: { 
            "Content-Type": "application/json"
        }
    };

    client.post(myuri, args, _function)
}

function _getConfig(data, response){
    console.log("new token:" + data.access_token)
    getConfig(data.access_token, _getConfigBiss)
}

/* Obtain the actual configuration*/
function _getConfigBiss(data, response){
    jsonObj = JSON.parse(data)
    config = jsonObj.data.configuration

    const configTime = new Date(config.lastchange).valueOf()
    const settingsTime = new Date(settings.lastchange).valueOf()

    if(configTime > settingsTime) {
        settings = config;
        fs.writeFile(filename, JSON.stringify(settings), (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
}
}

module.exports = {
    getConfig: getConfig,
    postConfig: postConfig,
    authenticate: authenticate,
    _getConfig:  _getConfig,
}
