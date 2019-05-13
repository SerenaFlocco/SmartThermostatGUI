#!/usr/bin/env node

/** 
 *  WebSocket server: listen on mqtt topic-->when a msg is received, send it to the client
*/
const express = require('express');
var mqtt = require('mqtt');
const app = express();
var application_root = __dirname;
var mqtt_client  = mqtt.connect('mqtt://localhost');
const wss = require('ws').Server;
var server = new wss({port: 8080});

app.use('frontend/css/', express.static(__dirname + '/frontend/css/'));
app.use('frontend/font/', express.static(__dirname + '/frontend/font/'));
app.use('frontend/iconfont/', express.static(__dirname + '/frontend/iconfont/'));
app.use('frontend/js/', express.static(__dirname + '/frontend/js/'));
app.use('frontend/scss/', express.static(__dirname + '/frontend/scss/'));
app.use('frontend/solar/', express.static(__dirname + '/frontend/solar/'));
app.use(express.static(application_root));

app.get('/', (req, res) => {
    res.sendFile('/index.html', {application_root});
});

app.get('/antifreeze_page.html', (req, res) => {
  res.sendFile('/antifreeze_page.html', {application_root});
});

app.listen(3000, () => console.log('App listening on port 3000...'));

var received_temperature = '';

server.on('connection', (ws) => {
    var topic_id = setInterval(() => {
		ws.send(received_temperature);
		console.log(`Message ${received_temperature} sent via websocekt`);
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
