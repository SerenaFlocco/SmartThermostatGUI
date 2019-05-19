#!/usr/bin/env node

/**
 *  WebSocket server: listen on mqtt topic-->when a msg is received, send it to the client
*/
'use strict';
const express   = require('express');
const app       = express();
const path      = require('path');
const fs        = require('fs');
const mqtt      = require('mqtt');
const exec      = require('child_process').exec;
const wss       = require('ws').Server;
const wifi        = require('node-wifi');

const filename    = 'settings.json';
var mqtt_client   = mqtt.connect('mqtt://localhost');
var server        = new wss({port: 8080});
var received_temperature = '';


/**
 *  Set a static folder
 *  from the official documentation
 * `Static files are files that clients download as they are from the server`
 */
app.use(express.static(path.join(__dirname, 'frontend')))


// pages routing

/* Home page*/
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'frontend','index.html'))
});

/* antifreeze page settings*/
app.get('/antifreeze', (req, res) => {
  res.sendFile(path.join(__dirname,'frontend','antifreeze_page.html'))
});

/* weekend program settings*/
app.get('/weekend', (req, res) => {
  res.sendFile(path.join(__dirname,'frontend','weekend_page.html'))
});

/* manal program settings*/
app.get('/prog', (req, res) => {
  res.sendFile(path.join(__dirname,'frontend','prog_page.html'))
});

/* wifi settings*/
app.get('/wifi', (req, res) => {

  wifi.init({
    iface : null // network interface, choose a random wifi interface if set to null
  });

  // Scan networks
  wifi.scan(function(err, networks) {
      if (err) {
          console.log(err);
      } else {
          console.log(networks);
          /*
          networks = [
              {
                ssid: '...',
                bssid: '...',
                mac: '...', // equals to bssid (for retrocompatibility)
                channel: <number>,
                frequency: <number>, // in MHz
                signal_level: <number>, // in dB
                quality: <number>, // same as signal level but in %
                security: 'WPA WPA2' // format depending on locale for open networks in Windows
                security_flags: '...' // encryption protocols (format currently depending of the OS)
                mode: '...' // network mode like Infra (format currently depending of the OS)
              },
              ...
          ];
          */
      }
  });

  //res.sendFile(path.join(__dirname,'frontend','wifi_page.html'))
});

/* shutdown the device*/
app.get('/poweroff', (req,res) => {
  res.send(200);
  console.log("poweroff");
  exec(`shutdown now`,(error,stdout,stderr) =>{ callback(stdout)});
})

// start the server
app.listen(3000, () => console.log('App listening on port 3000...'));


server.on('connection', (ws) => {
  try {
    if (fs.existsSync(filename)) {
      let rawdata = fs.readFileSync(filename);
      let settings = JSON.parse(rawdata);
      console.log('Sending settings to frontend...');
      ws.send(JSON.stringify(settings)); //check if it can be send as an object
    }
    else {
      console.log('Sending negative response to frontend...');
      ws.send('No json available');
    }
  } catch(err) {
    console.error(err);
  }

	ws.on('message', (msg) => {
		console.log('Received settings from frontend...');
		let data = JSON.parse(msg.data);
		console.log(data);
		fs.writeFileSync(filename, JSON.stringify(data));
	});

    var topic_id = setInterval(() => {
		ws.send(received_temperature);
		console.log(`Message ${received_temperature} sent via websocket`);
	},30000);
});

mqtt_client.on('connect', () => {
    mqtt_client.subscribe('temperature');
    console.log('Web App backend waiting for an mqtt message from the sensor...');
  });

mqtt_client.on('message', (topic, msg) => {
    console.log(`Message ${msg} received via MQTT`);
    received_temperature = msg.toString();
});

process.on('uncaughtException', () => {
  server.close();
});

process.on('SIGTERM', () => {
  server.close();
});
