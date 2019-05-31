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
const exphbs    = require('express-handlebars');
const fs        = require('fs');
var settings    = require('./settings.json');
const filename  = 'settings.json';
var mqtt_client   = mqtt.connect('mqtt://localhost');
var server        = new wss({port: 8080});
var received_temperature = '';
/*flag to change temperature shown during manual setting
var flag = 0;*/
//flag used in the weekend mode
var flag2 = 0;

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

// handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.urlencoded());
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

// Members API Routes
app.use('/api/settings', require('./routes/api/settings'));

// start the server
app.listen(3000, () => console.log('App listening on port 3000...'));


server.on('connection', (ws) => {
  //check periodically if the set temperature is greater than the current one:
  //if yes switch on the heating/cooling system, otherwise switch it off
  setInterval(() => {
    //let rawdata = fs.readFileSync('settings.json');  
    //let settings = JSON.parse(rawdata);
    if(settings.mode != 'off' /*&& flag == 0*/) {
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
  }, 5000);
  var topic_id = setInterval(() => {
    if(received_temperature != '') {
      ws.send('temp:' + received_temperature);
      console.log(`Message ${received_temperature} sent via websocket`);
    }
	},30000);
});

//Check if weekend mode, antifreeze mode or the prog mode is enabled
setInterval(() => {
  console.log('Interval to check the mode');
  //let rawdata = fs.readFileSync('settings.json');  
  //let settings = JSON.parse(rawdata);
  let date = new Date();
  //to be tested
  if(settings.weekend.enabled == 1) {
    let from = parseDate(settings.weekend.from[0], settings.weekend.from[1], settings.weekend.from[2]);
    let to = parseDate(settings.weekend.to[0], settings.weekend.to[1], settings.weekend.to[2]);
    if(date >= from && date <= to) {
        settings.mode = 'off';
        if(flag2 != 0)
          flag2 = 0;
    } else {
        if(flag2 != 1) {
          settings.mode = 'prog';
          flag2 = 1;
        }
    }
    //fs.writeFileSync(filename, JSON.stringify(settings));
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
      if (err) {
          console.log('Error writing file', err);
      } else {
          console.log('Successfully wrote file');
      }
    });
  }
  //to be tested
  if(settings.mode == 'prog' && settings.antifreeze.enabled == 0) {
    let progarray = getDay(date.getDay(), settings);
    let index = date.getHours();
    settings.temp_to_reach = progarray[index];
    //fs.writeFileSync(filename, JSON.stringify(settings));
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
    //fs.writeFileSync(filename, JSON.stringify(settings));
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
      if (err) {
          console.log('Error writing file', err);
      } else {
          console.log('Successfully wrote file');
      }
    });
  }
}, 5000);

mqtt_client.on('connect', () => {
    mqtt_client.subscribe('temperature');
    console.log('Web App backend waiting for an mqtt message from the sensor...');
  });

mqtt_client.on('message', (topic, msg) => {
    console.log(`Message ${msg} received via MQTT`);
    received_temperature = msg.toString();
    //modify the json file
    settings.current_temperature = msg; // to test
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
      if (err) {
          console.log('Error writing file', err);
      } else {
          console.log('Successfully wrote file');
      }
    });
});

process.on('uncaughtException', () => {
  server.close();
});

process.on('SIGTERM', () => {
  server.close();
});
