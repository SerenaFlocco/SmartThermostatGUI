var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');
var status = false; //off
var topic = "actuator";

 
client.on('connect', function () {
   if(client.connected){
	console.log("*** Actuator: CONNECTED ***");
	client.subscribe(topic);	   
   }else{
	console.log("--- Actuator: CONNECTION FAILED ---");
   }
})
 

client.on('message',function(topic,message){
	console.log("*** Actuator: RECEIVED " + message.toString() + " ***");
})
