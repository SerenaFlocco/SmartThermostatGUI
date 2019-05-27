#!/usr/bin/env node

/**
 * Entry point of the application
 */

'use strict';
const express   = require('express');
const app       = express();
const path      = require('path');

const fs        = require('fs');
const mqtt      = require('mqtt');

const wss       = require('ws').Server;
const exphbs    = require('express-handlebars');
const filename    = 'settings.json';
var mqtt_client   = mqtt.connect('mqtt://localhost');
var server        = new wss({port: 8080});
var received_temperature = '';

// handlebars middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/'
}));
app.set('view engine', 'handlebars');
app.use(express.urlencoded());


/**
 *  Set a static folder
 *  from the official documentation
 * `Static files are files that clients download as they are from the server`
 */
app.use(express.static(path.join(__dirname, 'public')))

// setup controllers
app.use(require('./controllers'))

app.listen(3000, function() {
  console.log('Listening on port 3000...')
})


// TODO split in a separate module
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
  