/*var Client = require('node-rest-client').Client;
var client = new Client();*/

//TEST THE RESPONSES!!!

function getConfig(client, uri, token) {
    const myuri = uri + '/user/PL19-11/devices';
    let args = {
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "JWT ::" + token
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

function postConfig(uri, settings, mac, nickname, token) {
    const myuri = uri + '/user/PL19-11/devices';
    let args = {
        data: {"device_mac":mac, "nickname": nickname, "configuration":settings},
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "JWT ::" + token
        }
    };
    client.post(myuri, args, (data, response) => {
        // parsed response body as js object
        console.log(data);
        // raw response
        console.log(response);
    });
}

function authenticate(uri, username, pwd) {
    const myuri = uri + '/auth';
    let args = {
        data : {"username":username, "password":pwd},
        headers: { 
            "Content-Type": "application/json"
        }
    };
    client.post(myuri, args, (data, response) => {
        // parsed response body as js object
        console.log(data);
        // raw response
        console.log(response);
    });
    return data.access_token;
}