#!/usr/bin/env node

/**
 *  WebSocket server: listen on mqtt topic-->when a msg is received, send it to the client
*/
'use strict';
const express   = require('express');
const app       = express();
const path      = require('path');
const mqtt      = require('mqtt');
const exec      = require('child_process').exec;
const wss       = require('ws').Server;
const piWifi    = require('pi-wifi');
const exphbs    = require('express-handlebars');
//var settings    = require('./settings.json');
var mqtt_client   = mqtt.connect('mqtt://localhost');
var server        = new wss({port: 8080});
var received_temperature = '';
//flag to change temperature shown during manual setting
var flag = 0;

function getDay(number, settings) {
  switch(number) {
      case 1: return settings.program.monday;
      case 2: return settings.program.tuesday;
      case 3: return settings.program.wednesday;
      case 4: return settings.program.thursday;
      case 5: return settings.program.friday;
      case 6: return settings.program.saturday;
      case 7: return settings.program.sunday;
  }
}

// handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 *  Set a static folder
 *  from the official documentation
 * `Static files are files that clients download as they are from the server`
 */
app.use(express.static(path.join(__dirname, 'public')))


// pages routing

/* demo page*/
app.get('/demo', (req, res) => {res.render('demo')})

/* Home page*/
app.get('/', (req, res) => {res.render('index')})

/* antifreeze page settings*/
app.get('/antifreeze', (req, res) => { res.render('antifreeze')});

/* program settings*/
app.get('/prog', (req, res) => { res.render('prog')});

/* weekend program settings */
app.get('/weekend', (req, res) => { res.render('weekend')});

/* manal program settings*/
/*app.get('/prog', (req, res) => {
  res.sendFile(path.join(__dirname,'frontend','prog_page.html'))
});*/

/* wifi settings*/
app.get('/wifi', (req, res) => {

  let avNetworks;
  // list all the available networks
  piWifi.scan(function(err, networks) {
    if (err) {
      return console.error(err.message);
    }
    console.log(networks);
    res.render('wifi', {
	avNetworks: networks,
	status: "undefined"
	});
  });
});

app.get('/connect/:ssid', (req, res) => {
  let ssid = req.params.ssid;
  res.send(ssid);
})

/* shutdown the device*/
app.get('/poweroff', (req,res) => {
  res.send(200);
  console.log("poweroff");
  exec(`shutdown now`,(error,stdout,stderr) =>{ callback(stdout)});
})

// Members API Routes
app.use('/api/settings', require('./routes/api/settings'));

// start the server
app.listen(3000, () => console.log('App listening on port 3000...'));


server.on('connection', (ws) => {
    //check periodically if the set temperature is greater than the current one:
    //if yes switch on the heating/cooling system, otherwise switch it off
    setInterval(() => {
      let rawdata = fs.readFileSync('settings.json');  
      let settings = JSON.parse(rawdata);
      if(settings.mode != 'off' && flag == 0) {
          switch(settings.season) {
              case 'winter':
                  if((settings.temp_to_reach > settings.current_temperature) && settings.heating == 0) {
                      settings.heating = 1;
                      console.log('Sending settings to backend...');
                      //trigger the frontend to show the heating logo
                      ws.send('heating:on');
                  } else {
                      if((settings.temp_to_reach <= settings.current_temperature) && settings.heating==1) {
                          settings.heating = 0;
                          console.log('Sending settings to backend...');
                          //trigger the frontend to hide the heating logo
                          ws.send('heating:off');
                      }
                  };
                  break;
              case 'summer':
                  if((settings.temp_to_reach < settings.current_temperature) && settings.cooling == 0) {
                      settings.cooling = 1;
                      console.log('Sending settings to backend...');
                      //trigger the frontend to show the cooling logo
                      ws.send('cooling:on');
                  } else {
                      if((settings.temp_to_reach >= settings.current_temperature) && settings.cooling == 1) {
                          settings.cooling = 0;
                          console.log('Sending settings to backend...');
                          //trigger the frontend to hide the cooling logo
                          ws.send('cooling:off');
                      }
                  };
                  break;
          }
      }
    }, 20000);
    var topic_id = setInterval(() => {
		ws.send('temp:' + received_temperature);
		console.log(`Message ${received_temperature} sent via websocket`);
	},30000);
});

//Check if weekend mode or the prog mode is enabled
setInterval(() => {
  let rawdata = fs.readFileSync('settings.json');  
  let settings = JSON.parse(rawdata);
  let date = new Date();
  if(settings.weekend.enabled == 1) {
      if(date >= settings.weekend.from && date <= settings.weekend.to)
              settings.mode = 'off';
          else {
              settings.mode = 'prog';
          }
          fs.writeFileSync('settings.json', JSON.stringify(settings));
  }
  if(settings.mode == 'prog') {
      let progarray = getDay(date.getDay, settings);
      let index = date.getHours();
      settings.temp_to_reach = progarray[index];
      fs.writeFileSync('settings.json', JSON.stringify(settings));
  }
}, 3600000);

mqtt_client.on('connect', () => {
    mqtt_client.subscribe('temperature');
    console.log('Web App backend waiting for an mqtt message from the sensor...');
  });

mqtt_client.on('message', (topic, msg) => {
    console.log(`Message ${msg} received via MQTT`);
    received_temperature = msg.toString();
    //modify the json file
});

process.on('uncaughtException', () => {
  server.close();
});

process.on('SIGTERM', () => {
  server.close();
});
