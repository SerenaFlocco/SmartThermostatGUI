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
const exphbs    = require('express-handlebars');
const filename    = 'settings.json';
var mqtt_client   = mqtt.connect('mqtt://localhost');
var server        = new wss({port: 8080});
var received_temperature = '';


// handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.urlencoded());


/**
 *  Set a static folder
 *  from the official documentation
 * `Static files are files that clients download as they are from the server`
 */
app.use(express.static(path.join(__dirname, 'public')))


// pages routing

/* demo page*/
//app.get('/demo', (req, res) => {res.render('demo')})

/* Home page*/
/*app.get('/', (req, res) => {
  // look ad index
})*/

/* antifreeze page settings*/
//app.get('/antifreeze', (req, res) => { res.render('antifreeze')});

/* program settings*/
//app.get('/prog', (req, res) => { res.render('prog')});

/* weekend program settings */
//app.get('/weekend', (req, res) => { res.render('weekend')});


/* wifi settings*/
app.get('/wifi', (req, res) => {
  // list all the available networks
  piWifi.scan(function(err, networks) {
    if (err) {
      return console.error(err.message);
    }
    //console.log(networks);
    //var obj = JSON.parse(networks);
    if(networks.result == "FAIL-BUSY")
	res.render('error', {
      		message: "failed to load wifi access points: SERVICE BUSY"
    	});
    else
    //load the html page
    res.render('wifi', {
    avNetworks: networks
    });
  });
});

app.get('/wifi/:ssid', (req, res) => {
  let ssid = req.params.ssid;
  res.render('wifi_ssid', {
    ssid: ssid
  })
})

app.post('/connect', (req, res) => {
  piWifi.connect(req.body.ssid, req.body.password, function(err) {
    if (!err) {
      setTimeout(() => {
        console.log("timeout");
        /*piwifi.check(ssid, function (err, status) {
          if (!err && status.connected) {
            console.log('Connected to the network ' + ssid + '!');
            res.render('ok', {
              message: 'Connected to the network ' + ssid
            });
          } else {
            console.log('Unable to connect to the network ' + ssid + '!');
            res.render('error', {
              message: 'Unable to connect to the network ' + ssid
            });
          }
        });*/
        res.render('ok', {
          message: 'Connected to the network ' + ssid
        });
      }, 2000);
    }else{
      res.render('error', {
        message: "failed to connect on " + req.body.ssid + ": " + err
      })
      return console.error(err.message);
    }
    
  });
})

/* shutdown the device*/
/*app.get('/poweroff', (req,res) => {
  //res.send(200);
  console.log("poweroff");
  exec('shutdown now',(error,stdout,stderr) =>{ callback(stdout)});
})*/

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