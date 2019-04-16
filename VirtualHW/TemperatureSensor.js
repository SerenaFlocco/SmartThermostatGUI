var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');
var message = '18';
var topic = "temperature";
var intervall = 5000;

 
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
  console.log("*** TemperatureSensor: PUBLISHING " + msg + "  ***");
if (client.connected == true)
  client.publish(topic,msg,options);
}
