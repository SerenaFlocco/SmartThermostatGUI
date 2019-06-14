var Client = require('node-rest-client').Client;
var client = new Client();
const uri = 'http://ec2-34-220-162-82.us-west-2.compute.amazonaws.com:5002';
const username = 'PL19-11';
const pwd = 'polit0';
var settings;

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
    // direct way
    client.get(myuri, args, _function)
}

//update configuration
function postConfig(settings, mac, nickname, token) {
    const myuri = uri + '/user/PL19-11/devices';
    let args = {
        data: {"device_mac":mac, "nickname": nickname, "configuration":settings},
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "JWT " + token
        }
    };
    client.post(myuri, args, (data, response) => {
        // parsed response body as js object
        console.log(data);
        // raw response
        console.log(response);
    });
}

//request for authentication-->response=token
function authenticate(_function, settings) {
    const myuri = uri + '/auth';
    let args = {
        data : {"username":username, "password":pwd},
        headers: { 
            "Content-Type": "application/json"
        }
    };
    client.post(myuri, args, _function)
}

function _checkConfig(data,response){
        // parsed response body as js object
        jsonObj = JSON.parse(data)
        console.log(jsonObj.data.configuration)
}

function _getConfig(data, response,){
    console.log(data.access_token);
    console.log("now ask for configurations")
    getConfig(data.access_token,_checkConfig)
}

authenticate(_getConfig);