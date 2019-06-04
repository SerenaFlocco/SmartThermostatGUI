#!/usr/bin/env node
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');
var topic = "relay";

 
client.on('connect', function () {
   if(client.connected){
	console.log("*** CONNECTED ***");
	client.subscribe(topic);	   
   }else{
	console.log("--- CONNECTION FAILED ---");
   }
})
 

client.on('message',function(topic,message){
    console.log("*** RECEIVED " + message.toString() + " ***");
    switch (message.toString()) {
        case "cooling:on":
          console.log("Cooling on");
          break;
        case "cooling:off":
          console.log("Cooling off");
          break;
        case "heating:on":
          console.log("Heating on");
          break;
        case "heating:off":
          console.log("Heating off");
          break;
      }
})
