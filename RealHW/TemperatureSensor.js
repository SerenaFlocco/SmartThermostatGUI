#!/usr/bin/env node

var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');
var message = '18';
var topic = "temperature";
var intervall = 5000;
var sensor =  require('node-dht-sensor');

 
client.on('connect', function () {
   if(client.connected){
	console.log("*** TemeratureSensor: CONNECTED ***");
	var topic_id = 	setInterval(function(){
		 publish(topic,message)},
	5000);
	console.log("*** TemperatureSensor: NEW INRERVAL " + intervall/1000 + "s ***");	   
   }else{
	console.log("--- TemperatureSensor: CONNECTION FAILED ---");
	}
})
 

//publish function
function publish(topic,msg,options){

	// read the sensor
	var model = 22;
	var gpioPort = 22;
	sensor.read(model, port, function(err, temperature, humidity) {
    if (!err) {
        console.log('temp: ' + temperature.toFixed(1) + '°C, ' +
            'humidity: ' + humidity.toFixed(1) + '%'
				);
			msg = temperature.toFixed(1);
    }
	});

  console.log("*** TemperatureSensor: PUBLISHING " + msg + "  ***");
if (client.connected == true)
  client.publish(topic,msg,options);
}

