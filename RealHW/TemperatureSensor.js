#!/usr/bin/env node

var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');
var message = '18';
var topic = "temperature";
var intervall = 5000;
var sensor = require('node-dht-sensor');
 


 
client.on('connect', function () {
   if(client.connected){
	console.log("*** TemeratureSensor: CONNECTED ***");
	var topic_id = 	setInterval(function(){ publish(topic,message)},5000);
	console.log("*** TemperatureSensor: NEW INRERVAL " + intervall/1000 + "s ***");	   
   }else{
	console.log("--- TemperatureSensor: CONNECTION FAILED ---");
	}
})
 

//publish function
function publish(topic,msg,options){
  
		if (client.connected == true){
				sensor.read(22, 4, function(err, temperature, humidity) {
						 if (!err) {
											if(temperature){
													console.log("*** TemperatureSensor: PUBLISHING " + temperature.toFixed(1) + "  ***");
													client.publish(topic,temperature.toFixed(1),options);
											}
						 }
				});
		}
}

