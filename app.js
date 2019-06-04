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
var settings    = require('./settings.json');
const filename    = 'settings.json';
const EventEmitter = require('events');
var eventemitter = new EventEmitter();
/*flag used when weekend mode is active: it is 0 during the time interval in which mode=off,
while it is 1 if it is expired and mode has to be set prog */
var flag = 0;
/*flag used to limit the times the mode is set to off during the weekend mode*/
var counter = 0;

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
app.use(express.static(path.join(__dirname, 'public')))

// setup controllers
app.use(require('./controllers'))

app.put('/api/settings/season', function (req, res, next) {
  console.log("before");
  const updated = req.body;
  if(updated.season == 'winter')
      eventemitter.emit('coolingoff');
  else eventemitter.emit('heatingoff');
  next();
});




// Members API Routes
app.use('/api/settings', require('./routes/api/settings'));

app.listen(3000, function() {
  console.log('Listening on port 3000...')
})

mac.getMac((err, macAddress) => {
  if (err)  throw err
  settings.mac = macAddress;
  //write the json file
  fs.writeFile(filename, JSON.stringify(settings), (err) => {
    if (err) {
        console.log('Error writing file', err);
    } else {
        console.log('Successfully wrote file');
    }
  });
});

server.on('connection', (ws) => {
  console.log("NEW CONNECTION" + ws );

  eventemitter.on('heatingon', () => {
    if(ws.readyState === WebSocket.OPEN)
      ws.send('heating:on');
  });

  eventemitter.on('heatingoff', () => {
    if(ws.readyState === WebSocket.OPEN)
      ws.send('heating:off');
  });

  eventemitter.on('coolingon', () => {
    if(ws.readyState === WebSocket.OPEN)
      ws.send('cooling:on');
  });

  eventemitter.on('coolingoff', () => {
    if(ws.readyState === WebSocket.OPEN)
      ws.send('cooling:off');
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
  if(settings.mode != 'off') {
    switch(settings.season) {
      case 'winter':
        if((settings.temp_to_reach > settings.current_temperature) && settings.heating == 0) {
            settings.heating = 1;
            console.log('Sending settings to frontend...');
            //trigger the frontend to show the heating logo-->emit event
            eventemitter.emit('heatingon');
            //write the json file
            fs.writeFile(filename, JSON.stringify(settings), (err) => {
              if (err) {
                  console.log('Error writing file', err);
              } else {
                  console.log('Successfully wrote file');
              }
            });
        } else {
            if((settings.temp_to_reach <= settings.current_temperature) && settings.heating==1) {
                settings.heating = 0;
                console.log('Sending settings to frontend...');
                //trigger the frontend to hide the heating logo-->emit event
                eventemitter.emit('heatingoff');
                //write the json file
                fs.writeFile(filename, JSON.stringify(settings), (err) => {
                  if (err) {
                      console.log('Error writing file', err);
                  } else {
                      console.log('Successfully wrote file');
                  }
                });
            }
        };
        break;
      case 'summer':
        if((settings.temp_to_reach < settings.current_temperature) && settings.cooling == 0) {
            settings.cooling = 1;
            console.log('Sending settings to frontend...');
            //trigger the frontend to show the cooling logo-->emit event
            eventemitter.emit('coolingon');
            //write the json file
            fs.writeFile(filename, JSON.stringify(settings), (err) => {
              if (err) {
                  console.log('Error writing file', err);
              } else {
                  console.log('Successfully wrote file');
              }
            });
        } else {
            if((settings.temp_to_reach >= settings.current_temperature) && settings.cooling == 1) {
                settings.cooling = 0;
                console.log('Sending settings to frontend...');
                //trigger the frontend to hide the heating logo-->emit event
                eventemitter.emit('coolingoff');
                //write the json file
                fs.writeFile(filename, JSON.stringify(settings), (err) => {
                  if (err) {
                      console.log('Error writing file', err);
                  } else {
                      console.log('Successfully wrote file');
                  }
                });
            }
        };
        break;
      }
  }
}, 5000);

//Check if weekend mode, antifreeze mode or the prog mode is enabled
setInterval(() => {
  console.log('Interval to check the mode');
  let date = new Date();
  //to be tested
  if(settings.weekend.enabled == 1) {
    let from = parseDate(settings.weekend.from[0], settings.weekend.from[1], settings.weekend.from[2]);
    let to = parseDate(settings.weekend.to[0], settings.weekend.to[1], settings.weekend.to[2]);
    if(date >= from && date <= to && counter == 0) {
        settings.mode = 'off';
        settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
        fs.writeFile(filename, JSON.stringify(settings), (err) => {
          if (err) {
              console.log('Error writing file', err);
          } else {
              console.log('Successfully wrote file');
          }
        });
        counter = 1;
        if(flag != 0)
          flag = 0;
    } else {
        if(flag != 1) {
          settings.mode = 'prog';
          settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
          fs.writeFile(filename, JSON.stringify(settings), (err) => {
            if (err) {
                console.log('Error writing file', err);
            } else {
                console.log('Successfully wrote file');
            }
          });
          flag = 1;
          counter = 0;
        }
    }
  }
  //to be tested
  if(settings.mode == 'prog' && settings.antifreeze.enabled == 0) {
    let progarray = getDay(date.getDay(), settings);
    let index = date.getHours();
    settings.temp_to_reach = progarray[index];
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
      if (err) {
          console.log('Error writing file', err);
      } else {
          console.log('Successfully wrote file');
      }
    });
  }
  if(settings.antifreeze.enabled == 1) {
    settings.temp_to_reach = settings.antifreeze.temp;
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
      if (err) {
          console.log('Error writing file', err);
      } else {
          console.log('Successfully wrote file');
      }
    });
  }
}, 5000);

relay_mqtt_client.on('connect', () => {
  if(relay_mqtt_client.connected){
    console.log("Relay client: CONNECTED ");
    eventemitter.on('heatingon', () => {
      //publish
      let message = 'heating:on';
      publish('relay',message);
    });
    eventemitter.on('heatingoff', () => {
      //publish
      let message = 'heating:off';
      publish('relay',message);
    });
    eventemitter.on('coolingon', () => {
      //publish
      let message = 'cooling:on';
      publish('relay',message);
    });
    eventemitter.on('coolingoff', () => {
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
    //modify the json file
    settings.current_temperature = Number.parseFloat(msg.toString()); // to test
    console.log(settings.current_temperature);
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
      if (err) {
          console.log('Error writing file', err);
      } else {
          console.log('Successfully wrote file');
      }
    });
});

/*process.on('uncaughtException', (err) => {
  console.log(e);
});*/

process.on('SIGTERM', (e) => {
  //server.close();
  //console.log("error!!!!!!!!!!")
  //console.log(e.data);
});

  
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
      case 'Sunday': return 7;
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
