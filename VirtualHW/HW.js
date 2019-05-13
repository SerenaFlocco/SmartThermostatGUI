#!/usr/bin/env node

require('log-timestamp'); // add timestamps in front of log messages
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');
var status = false; //off
var message = '10';
var topic_actuator = "actuator";
var topic_sensor= "temperature";
var intervall = 5000;

 
client.on('connect', function () {
   if(client.connected){
	console.log(" VirtualHW: CONNECTED ");
	client.subscribe(topic_actuator);
	var topic_id = 	setInterval(function(){ publish(topic_sensor,message)},5000);
	console.log(" TemperatureSensor: NEW INRERVAL " + intervall/1000 + "s ");	   
   }else{
	console.log("--- VirtualHW: CONNECTION FAILED ---");
   }
})
 

client.on('message',function(topic,message){
	console.log(" Actuator: RECEIVED " + message.toString());
	if(message.toString() == 'on'){
		status = true;
		console.log(" Actuator: State ON");
	}
	if(message.toString() == 'off'){
		status = false;
		console.log(" Actuator: State OFF");
	}
})

function publish(topic,msg,options){
  console.log(" TemperatureSensor: PUBLISHING " + msg);
if (client.connected == true)
  client.publish(topic,msg,options);
}
