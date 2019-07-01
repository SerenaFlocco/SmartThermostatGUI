var Client = require('node-rest-client').Client;
var client = new Client();
const uri = 'http://ec2-34-220-162-82.us-west-2.compute.amazonaws.com:5002';
const username = 'PL19-11';
const pwd = 'polit0';
var settings    = require('../settings.json');
const EventEmitter = require('events');
var eventemitter = new EventEmitter();
const fs        = require('fs');
const filename    = 'settings.json';

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
    client.get(myuri, args, _function);
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
    client.post(myuri, args,_postConfig);
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
    client.post(myuri, args, _function);
}

function _getConfig(data, response){
    console.log("new token:" + data.access_token);
    getConfig(data.access_token, _getConfigBiss);
}

/* Obtain the actual configuration*/
function _getConfigBiss(data, response){
    
    clearString = data.replace(/u'/g, "'")
    clearString2 = clearString.replace(/'/g, '"')
    res = clearString2.split('"configuration": "')
    res2 = res[1].split('", "device_mac":')
    final = res2[0]
    config = JSON.parse(final);
    console.log(config);


    let configTime_ = parseTimestamp(config.timestamp);
    let settingsTime_ = parseTimestamp(settings.timestamp);

    //check the passive timpestamp
    if(configTime_ > settingsTime_) {
        /** check what happened!!!
         * -heating on?
         * -heating off?
         * -cooling on?
         * -cooling off?
         * -new temperature?
         */
        console.log("entrato1")
        if(settings.current_temperature != config.current_temperature) {
            settings.current_temperature = config.current_temperature;
            eventemitter.emit('newtemp');
        }
        if(settings.heating != config.heating && config.season == 'winter') {
            switch(settings.heating) {
                case 0: settings.heating = config.heating;
                        eventemitter.emit('heatingon');
                        break;
                case 1: settings.heating = config.heating;
                        eventemitter.emit('heatingoff');
                        break;
            }
        }
        if(settings.cooling != config.cooling && config.season == 'summer') {
            switch(settings.cooling) {
                case 0: settings.cooling = config.cooling;
                        eventemitter.emit('coolingon');
                        break;
                case 1: settings.cooling = config.cooling;
                        eventemitter.emit('coolingoff');
                        break;
            }
        }

        //add the remaining case in which only the passive timestamp is set
    }

    let configTime = parseTimestamp(config.lastchange);
    let settingsTime = parseTimestamp(settings.lastchange);

    //check the active timestamp!!!
    if(configTime > settingsTime) {
        console.log("entrato2")
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

function parseTimestamp(timestamp) {
    let array = timestamp.split(':');
    let day = array[0].toString().split('/');
    //let date = new Date(day[2], day[1], day[0], array[1], array[2], array[3]);
    let date = new Date();
    date.setFullYear(day[2]);
    date.setMonth(day[1] - 1);
    date.setDate(day[0]);
    date.setHours(array[1]);
    date.setMinutes(array[2]);
    date.setSeconds(array[3]);
    console.log(date);
    return date;
}

module.exports = {
    getConfig: getConfig,
    postConfig: postConfig,
    authenticate: authenticate,
    _getConfig:  _getConfig,
    eventemitter: eventemitter
}