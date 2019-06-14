var Client = require('node-rest-client').Client;
var client = new Client();
const uri = 'http://ec2-34-220-162-82.us-west-2.compute.amazonaws.com:5002';
const username = 'PL19-11';
const pwd = 'polit0';

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

function _getConfig(data, response, _function){
    getConfig(data.access_token, _function)
}

/* Obtain the actual configuration*/
function func2(data, response){
    jsonObj = JSON.parse(data)
    return jsonObj.data.configuration
}

module.exports = {
    getConfig: this.getConfig,
    postConfig: this.postConfig,
    authenticate: this.authenticate,
    _getConfig:  this._getConfig,
    func2: this.func2
}