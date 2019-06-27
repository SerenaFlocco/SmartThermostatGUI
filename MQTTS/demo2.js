var Client = require('node-rest-client').Client;
var client = new Client();
const uri = 'http://ec2-34-220-162-82.us-west-2.compute.amazonaws.com:5002';
const username = 'PL19-11';
const pwd = 'polit0';

//TEST THE RESPONSES!!!

//get configuration
var getConfig = function getConfig(token) {
    const myuri = uri + '/user/PL19-11/devices';
    let args = {
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "JWT " + token
        }
    };
    // direct way
    client.get(myuri, args, (data, response) => {
        // parsed response body as js object
        console.log(data);
        // raw response
        console.log(response);
        return data.configuration;
    });
}

//update configuration
var postConfig = function postConfig(settings, mac, nickname, token) {
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
var authenticate = function authenticate(myFunc) {
    const myuri = uri + '/auth';
    let args = {
        data : {"username":username, "password":pwd},
        headers: { 
            "Content-Type": "application/json"
        }
    };
    client.post(myuri, args, (data,response)=>{
        console.log(data);
    });
}

function myFunc(data, response) {
    console.log(data)
    console.log
}

authenticate(myFunc);