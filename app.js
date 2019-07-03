#!/usr/bin/env node

/**
 * Entry point of the application
 */

'use strict';
const express   = require('express');
const app       = express();
const path      = require('path');
const mqtt      = require('mqtt');
const timestamp = require('time-stamp');
const WebSocket = require('ws');
const wss       = require('ws').Server;
const exphbs    = require('express-handlebars');
const mac = require('getmac');
//const exec      = require('child_process').exec;
var temperature_mqtt_client   = mqtt.connect('mqtt://localhost');
var relay_mqtt_client   = mqtt.connect('mqtt://localhost');
var server        = new wss({port: 8080});
var received_temperature = '';
const filename    = 'settings.json';
const syncfiles = require('./syncfiles.js');
const AWSclient = require('./AWSclient/RESTclient.js');
const MQTTSClient = require('./AWSclient/MQTTSClient.js');
/*flag used when weekend mode is active: it is 0 during the time interval in which mode=off,
while it is 1 if it is expired and mode has to be set prog */
var flag = 0;
/*variable used to limit the times the mode is set to off during the weekend mode*/
var counter = 0;
/*flag used to send mqtts events to AWS*/
var ischanged = 0;

// handlebars middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/'
}));
app.set('view engine', 'handlebars');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 *  Set a static folder
 *  from the official documentation
 * `Static files are files that clients download as they are from the server`
 */
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'views')));

// setup controllers
app.use(require('./controllers'))

app.put('/api/settings/season', function (req, res, next) {
  console.log("before");
  const updated = req.body;
  if(updated.season == 'winter')
      AWSclient.eventemitter.emit('coolingoff');
  else AWSclient.eventemitter.emit('heatingoff');
  next();
});

app.put('/api/settings/mode', function (req, res, next) {
  console.log("before");
  const updated = req.body;
  if(updated.mode == 'off') {
    AWSclient.eventemitter.emit('coolingoff');
    AWSclient.eventemitter.emit('heatingoff');
  }
  next();
});

// Members API Routes
app.use('/api/settings', require('./routes/api/settings'));

app.listen(3000, function() {
  console.log('Listening on port 3000...')
});

/** Get request for the configuration: if the lastchange field is equal to the local one-->ok,
 * otherwise modify the settings.json file
 */
 AWSclient.authenticate(AWSclient._getConfig); //request for the token

/** Set interval to make a get request for the configuration:
 * if the lastchange field is less than the local one-->send a post,
 * otherwise modify the settings.json file
*/
setInterval( () => {
  AWSclient.authenticate(AWSclient._getConfig);
}, 60000);

/*NOTA: DA REMOTO OCCORRE CONTROLLARE IL TIMESTAMP PASSIVO PER AGGIORNARE IL VALORE DELLA
TEMPERATURA RILEVATA E LO STATO DEL SISTEMA DI RISCALDAMENTO/RAFFREDDAMENTO!!!*/

mac.getMac((err, macAddress) => {
  if (err)  throw err;
  const conf = syncfiles.getSettings(filename);
  conf.mac = macAddress;
  //write the json file
  syncfiles.updateSettings(filename, conf);
});

server.on('connection', (ws) => {
  console.log("NEW CONNECTION" + ws );

  AWSclient.eventemitter.on('heatingon', () => {
    if(ws.readyState === WebSocket.OPEN)
      ws.send('heating:on');
  });

  AWSclient.eventemitter.on('heatingoff', () => {
    if(ws.readyState === WebSocket.OPEN)
      ws.send('heating:off');
  });

  AWSclient.eventemitter.on('coolingon', () => {
    if(ws.readyState === WebSocket.OPEN)
      ws.send('cooling:on');
  });

  AWSclient.eventemitter.on('coolingoff', () => {
    if(ws.readyState === WebSocket.OPEN)
      ws.send('cooling:off');
  });

  AWSclient.eventemitter.on('mode', () => {
    if(ws.readyState === WebSocket.OPEN) {
      const settings1 = syncfiles.getSettings(filename);
      ws.send('mode:' + settings1.mode);
    }
      console.log("event received");
  });

  AWSclient.eventemitter.on('season', () => {
    if(ws.readyState === WebSocket.OPEN) {
      const settings2 = syncfiles.getSettings(filename);
      ws.send('season:' + settings2.season);
    }
      console.log("event received");
  });

  setInterval(() => {
    if(received_temperature != '' && ws.readyState === WebSocket.OPEN) {
      ws.send('temp:' + received_temperature);
      console.log(`Message ${received_temperature} sent via websocket`);
    }
  },5000);

});

server.on('close', (ws) =>{
  console.log("close conection")
  ws.close();
})

/*check periodically if the set temperature is greater than the current one:
  if yes switch on the heating/cooling system, otherwise switch it off*/
setInterval(() => {
  const settings = syncfiles.updateSettings(filename);
  if(settings.mode != 'off') {
    switch(settings.season) {
      case 'winter':
        if(settings.temp_to_reach > settings.current_temperature) {
          if(settings.heating == 0)
            ischanged = 1;
          settings.heating = 1;
          console.log('Sending settings to frontend...');
          //trigger the frontend to show the heating logo-->emit event
          AWSclient.eventemitter.emit('heatingon');
          if(ischanged == 1) {
            //send mqtt EVENT only if the heating was 0
            MQTTSClient.sendEvent(2, settings.mac, 'heating on');
            //post request for configuration only if the heating was 0-->SET THE PASSIVE TIMESTAMP
            settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
            //reset the flag
            ischanged = 0;
          }
          // update configuration
          syncfiles.updateSettings(filename, settings);
        } else {
          if(settings.temp_to_reach <= settings.current_temperature) {
            if(settings.heating == 1)
              ischanged = 1;
            settings.heating = 0;
            console.log('Sending settings to frontend...');
            //trigger the frontend to hide the heating logo-->emit event
            AWSclient.eventemitter.emit('heatingoff');
            if(ischanged == 1) {
            //send mqtt EVENT only if the heating was 1
            MQTTSClient.sendEvent(3, settings.mac, 'heating off');
            //post request for configuration only if the heating was 1-->SET THE PASSIVE TIMESTAMP
            settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
            // post new configuration
            //AWSclient.authenticate(AWSclient.postConfig);
            //reset the flag
            ischanged = 0;
            }
            //update configuration
            syncfiles.updateSettings(filename, settings);
          }
        };
        break;
      case 'summer':
        if(settings.temp_to_reach < settings.current_temperature) {
          if(settings.cooling == 0)
            ischanged = 1;
          settings.cooling = 1;
          console.log('Sending settings to frontend...');
          //trigger the frontend to show the cooling logo-->emit event
          AWSclient.eventemitter.emit('coolingon');
          if(ischanged == 1) {
            //send mqtt EVENT only if the cooling was 0
            MQTTSClient.sendEvent(4, settings.mac, 'cooling on');
            //post request for configuration only if the cooling was 0-->SET THE PASSIVE TIMESTAMP
            settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
            // post new configuration
            //AWSclient.authenticate(AWSclient.postConfig);
            //reset the flag
            ischanged = 0;
          }
          //update configuration
          syncfiles.updateSettings(filename, settings);
        } else {
          if(settings.temp_to_reach >= settings.current_temperature) {
            if(settings.cooling == 1)
              ischanged = 1;
            settings.cooling = 0;
            console.log('Sending settings to frontend...');
            //trigger the frontend to hide the heating logo-->emit event
            AWSclient.eventemitter.emit('coolingoff');
            if(ischanged == 1) {
              //send mqtt EVENT only if the cooling was 1
              MQTTSClient.sendEvent(5, settings.mac, 'cooling off');
              //post request for configuration only if the cooling was 1-->SET THE PASSIVE TIMESTAMP
              settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
              // post new configuration
              //AWSclient.authenticate(AWSclient.postConfig);
              //reset the flag
              ischanged = 0;
            }
            //update configuration
            syncfiles.updateSettings(filename, settings);
          }
        };
        break;
    }
  }
}, 5000);

//Check if weekend mode, antifreeze mode or the prog mode is enabled
setInterval(() => {
  console.log('Interval to check the mode');
  var date = new Date();
  const settings3 = syncfiles.getSettings(filename);
  //to be tested
  if(settings3.weekend.enabled == 1) {
    let from = parseDate(settings3.weekend.from[0], settings3.weekend.from[1], settings3.weekend.from[2]);
    let to = parseDate(settings3.weekend.to[0], settings3.weekend.to[1], settings3.weekend.to[2]);
    if(date >= from && date <= to && counter == 0) {
      settings3.mode = 'off';
      settings3.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
      settings3.lastchange = timestamp('DD/MM/YYYY:HH:mm:ss');
      syncfiles.updateSettings(filename, settings3);
      counter = 1;
      if(flag != 0)
        flag = 0;
      // post new configuration
      //AWSclient.authenticate(AWSclient.postConfig);
    } else {
        if(flag != 1) {
          settings3.mode = 'prog';
          settings3.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
          settings3.lastchange = timestamp('DD/MM/YYYY:HH:mm:ss');
          syncfiles.updateSettings(filename, settings3);
          flag = 1;
          counter = 0;
          // post new configuration
          //AWSclient.authenticate(AWSclient.postConfig);
        }
    }
  }
  //to be tested
  if(settings3.mode == 'prog' && settings3.antifreeze.enabled == 0) {
    let progarray = getDay(date.getDay(), settings3);
    let index = date.getHours();
    if(settings3.temp_to_reach != progarray[index]) {
      settings3.temp_to_reach = progarray[index];
      //set only the passive timestamp
      settings3.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
      syncfiles.updateSettings(filename, settings3);
      // post new configuration
      //AWSclient.authenticate(AWSclient.postConfig);
    }
  }
  //check if the antifreeze is enabled
  if(settings3.antifreeze.enabled == 1 && settings3.season != 'summer') {
    if(settings3.temp_to_reach != settings3.antifreeze.temp) {
      settings3.temp_to_reach = settings3.antifreeze.temp;
      settings3.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
      syncfiles.updateSettings(filename, settings3);
      //send post request to configuration only if the temp_to_reach has changed-->SET THE PASSIVE TIMESTAMP
      //AWSclient.authenticate(AWSclient.postConfig);
    }
  }
}, 5000);

relay_mqtt_client.on('connect', () => {
  if(relay_mqtt_client.connected){
    console.log("Relay client: CONNECTED ");
    AWSclient.eventemitter.on('heatingon', () => {
      //publish
      let message = 'heating:on';
      publish('relay',message);
    });
    AWSclient.eventemitter.on('heatingoff', () => {
      //publish
      let message = 'heating:off';
      publish('relay',message);
    });
    AWSclient.eventemitter.on('coolingon', () => {
      //publish
      let message = 'cooling:on';
      publish('relay',message);
    });
    AWSclient.eventemitter.on('coolingoff', () => {
      //publish
      let message = 'cooling:off';
      publish('relay',message);
    });	   
  } else
    console.log("--- Relay client: CONNECTION FAILED ---");
});

temperature_mqtt_client.on('connect', () => {
    temperature_mqtt_client.subscribe('temperature');
    console.log('Web App backend waiting for an mqtt message from the sensor...');
  });

temperature_mqtt_client.on('message', (topic, msg) => {
    console.log(`Message ${msg} received via MQTT`);
    received_temperature = msg.toString();
    const config = syncfiles.getSettings(filename);
    //modify the json file
    config.current_temperature = Number.parseFloat(msg.toString());
    console.log(config.current_temperature);
    //send mqtt EVENT
    MQTTSClient.sendEvent(6, config.mac, 'received temperature');
    //SET THE PASSIVE TIMESTAMP
    config.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    syncfiles.updateSettings(filename, config);
    // post new configuration
    //AWSclient.authenticate(AWSclient.postConfig);
});

/*process.on('uncaughtException', (err) => {
  console.log(err);
  server.close();
});

process.on('SIGTERM', (e) => {
  server.close();
  //console.log("error!!!!!!!!!!")
  //console.log(e.data);
});*/

  
function getDay(number, settings) {
  switch(number) {
      case 0: return settings.program.sunday;
      case 1: return settings.program.monday;
      case 2: return settings.program.tuesday;
      case 3: return settings.program.wednesday;
      case 4: return settings.program.thursday;
      case 5: return settings.program.friday;
      case 6: return settings.program.saturday;
  }
}

function parseTime(time, spec) {
  if(spec == 'p.m.')
      time += 12;
  return time;
}

function parseDay(day) {
  switch(day) {
      case 'Monday': return 1;
      case 'Tuesday': return 2;
      case 'Wednesday': return 3;
      case 'Thursday': return 4;
      case 'Friday': return 5;
      case 'Saturday': return 6;
      case 'Sunday': return 0;
  }
}

function parseDate(day, time, spec) {
  let date = new Date();
  let mydate = new Date();
  let currentday = date.getDay();
  let myday = parseDay(day);
  let splittedtime = time.split(':');
  if(currentday > myday)
      mydate.setDate(date.getDate() + (currentday - myday));
  if(currentday < myday)
      mydate.setDate(date.getDate() - (myday - currentday));
  mydate.setHours(parseTime(splittedtime[0], spec));
  if(splittedtime[1] != '00')
      mydate.setMinutes(splittedtime[1]);
  return mydate;
}

function publish(topic,msg,options){
  console.log("Relay control: PUBLISHING " + msg);
  if (relay_mqtt_client.connected == true)
    relay_mqtt_client.publish(topic,msg,options);
}
