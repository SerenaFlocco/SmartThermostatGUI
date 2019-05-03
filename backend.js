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

app.listen(3000, () => console.log('App listening on port 3000...'));

let msg = '18 °C';
var flag = 0;

server.on('connection', (ws) => {
    ws.send(msg);
    console.log(`Message ${msg} sent.`);
});

/*mqtt_client.on('connect', () => {
    mqtt_client.subscribe('actuator');
    console.log('Web App backend waiting for an mqtt message from the sensor...');
  });

server.on('connection', (ws) => {
    while(1) {
        if(flag==1) {
            ws.send(msg);
            console.log(`Message ${msg} sent.`);
            flag = 0;
        }
    }
});

mqtt_client.on('message', (topic, msg) => {
    flag = 1;
});*/