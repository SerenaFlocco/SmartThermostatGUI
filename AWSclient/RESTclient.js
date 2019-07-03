var Client = require('node-rest-client').Client;
var client = new Client();
const uri = 'http://ec2-34-220-162-82.us-west-2.compute.amazonaws.com:5002';
const username = 'PL19-11';
const pwd = 'polit0';
//var settings    = require('../settings.json');
const EventEmitter = require('events');
var eventemitter = new EventEmitter();
const fs = require('fs');
const filename    = 'settings.json';
const syncfiles = require('../syncfiles.js');

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

    const configuration = syncfiles.getSettings(filename);

    let args = {
        data: {"device_mac":configuration.mac, "nickname": configuration.nickname, "configuration":configuration},
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

    const configuration = syncfiles.getSettings(filename);
    //console.log(configuration);

    /* NEW LOGIC BLOCK */

    let rasp_lastChange = parseTimestamp(config.lastchange);
    let lastChange = parseTimestamp(configuration.lastchange);
    let rasp_timeStamp = parseTimestamp(config.timestamp);
    let timeStamp = parseTimestamp(configuration.timestamp);

    if(lastChange > rasp_lastChange){
        // the configuration is more recent than one stored on AWS
        if(timeStamp < rasp_timeStamp){
            // the configuration stored on AWS is older but contains a new temperature
            console.log("NEW TEMPERATURE")
            // write temperature
            let newConfiguration = configuration;
            newConfiguration.current_temperature =  config.current_temperature;
            console.log(newConfiguration)
            syncfiles.updateSettings(filename, newConfiguration);

            // new temperature event
            eventemitter.emit('newtemp');
        }
        // post the new configuration
        authenticate(postConfig);
    }else{
        // theconfiguration is NOT more recent then the one stored on AWS
        
        // write file
        syncfiles.updateSettings(filename, config);

        // check all the events
        if(config.season == 'winter') {
            switch(config.heating) {
                case 0: //configuration.heating = config.heating;
                        eventemitter.emit('heatingoff');
                        console.log("heatingoff");
                        break;
                case 1: //configuration.heating = config.heating;
                        eventemitter.emit('heatingon');
                        console.log("heatingon");
                        break;
            }
        }
        if(config.season == 'summer') {
            switch(config.cooling) {
                case 0: //configuration.cooling = config.cooling;
                        eventemitter.emit('coolingoff');
                        console.log("coolingoff");
                        break;
                case 1: //configuration.cooling = config.cooling;
                        eventemitter.emit('coolingon');
                        console.log("coolingon");
                        break;
            }
        }
        eventemitter.emit('mode');
        eventemitter.emit('season');
        eventemitter.emit('newtemp');
       
    }

    /*******************/


    /*let configTime_ = parseTimestamp(config.timestamp);
    let settingsTime_ = parseTimestamp(configuration.timestamp);*/

    //check the passive timpestamp
    /*if(configTime_ > settingsTime_) {
        console.log("entrato1");
        
        syncfiles.updateSettings(filename, config);

        //configuration.current_temperature = config.current_temperature;
        eventemitter.emit('newtemp');

        if(config.season == 'winter') {
            switch(config.heating) {
                case 0: //configuration.heating = config.heating;
                        eventemitter.emit('heatingoff');
                        console.log("heatingoff");
                        break;
                case 1: //configuration.heating = config.heating;
                        eventemitter.emit('heatingon');
                        console.log("heatingon");
                        break;
            }
        }
        if(config.season == 'summer') {
            switch(config.cooling) {
                case 0: //configuration.cooling = config.cooling;
                        eventemitter.emit('coolingoff');
                        console.log("coolingoff");
                        break;
                case 1: //configuration.cooling = config.cooling;
                        eventemitter.emit('coolingon');
                        console.log("coolingon");
                        break;
            }
        }

        //add the remaining case in which only the passive timestamp is set
    }

    let configTime = parseTimestamp(config.lastchange);
    let settingsTime = parseTimestamp(configuration.lastchange);

    //check the active timestamp!!!
    if(configTime > settingsTime) {
        console.log("entrato2");
        eventemitter.emit('mode');
        eventemitter.emit('season');
        syncfiles.updateSettings(filename, config);
    }*/
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
    return date;
}

module.exports = {
    getConfig: getConfig,
    postConfig: postConfig,
    authenticate: authenticate,
    _getConfig:  _getConfig,
    eventemitter: eventemitter
}