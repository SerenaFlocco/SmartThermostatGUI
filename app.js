/**
 * Entry point of the application
 */

'use strict';
const express   = require('express');
const app       = express();
const path      = require('path');
const WebSocket = require('ws');
const wss       = require('ws').Server;
const exphbs    = require('express-handlebars');
var server        = new wss({port: 8080});
const syncfiles    = require('./syncfiles.js');
const filename = 'settings.json';
const AWSclient = require('./AWSclient/RESTclient.js');

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
 * if the lastchange field is equal to the local one-->ok,
 * otherwise modify the settings.json file
*/
setInterval( () => {
  AWSclient.authenticate(AWSclient._getConfig);
}, 60000);

/*NOTA: DA REMOTO OCCORRE CONTROLLARE IL TIMESTAMP PASSIVO PER AGGIORNARE IL VALORE DELLA
TEMPERATURA RILEVATA E LO STATO DEL SISTEMA DI RISCALDAMENTO/RAFFREDDAMENTO!!!*/

//QUANDO L'APP VIENE ACCESA PER LA PRIMA VOLTA DEVE AVERE DEI SETTINGS DI BASE? ALTRIMENTI COSA MOSTRA?

server.on('connection', (ws) => {
  console.log("NEW CONNECTION" + ws );

  AWSclient.eventemitter.on('heatingon', () => {
    if(ws.readyState === WebSocket.OPEN)
      ws.send('heating:on');
      console.log("event received");
  });

  AWSclient.eventemitter.on('heatingoff', () => {
    if(ws.readyState === WebSocket.OPEN)
      ws.send('heating:off');
      console.log("event received");
  });

  AWSclient.eventemitter.on('coolingon', () => {
    if(ws.readyState === WebSocket.OPEN)
      ws.send('cooling:on');
      console.log("event received");
  });

  AWSclient.eventemitter.on('coolingoff', () => {
    if(ws.readyState === WebSocket.OPEN)
      ws.send('cooling:off');
      console.log("event received");
  });

  AWSclient.eventemitter.on('newtemp', () => {
    if(ws.readyState === WebSocket.OPEN) {
      const settings = syncfiles.getSettings(filename);
      ws.send('temp:' + settings.current_temperature);
    }
      console.log("event received");
  });

  AWSclient.eventemitter.on('mode', () => {
    if(ws.readyState === WebSocket.OPEN) {
      const settings = syncfiles.getSettings(filename);
      ws.send('mode:' + settings.mode);
    }
      console.log("event received");
  });

  AWSclient.eventemitter.on('season', () => {
    if(ws.readyState === WebSocket.OPEN) {
      const settings = syncfiles.getSettings(filename);
      ws.send('season:' + settings.season);
    }
      console.log("event received");
  });

});

server.on('close', (ws) =>{
  console.log("close conection")
  ws.close();
});