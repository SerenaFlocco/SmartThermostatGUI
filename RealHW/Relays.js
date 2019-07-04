#!/usr/bin/env node
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');
var topic = "relay";
const raspi = require('raspi');
const gpio = require('raspi-gpio');

var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { sys.puts(stdout) }
exec("killall pigpiod", puts);
 

raspi.init(() => {
  
  const red_led = new gpio.DigitalOutput('GPIO7');
  const blue_led = new gpio.DigitalOutput('GPIO8');

  blue_led.write(gpio.LOW);
  red_led.write(gpio.LOW);

    client.on('connect', function () {
        if(client.connected){
        console.log("*** CONNECTED TO " +  topic + " ***");
        client.subscribe(topic);	   
        }else{
        console.log("--- CONNECTION FAILED ---");
        }
    })
  
    client.on('message',function(topic,message){
        console.log("*** RECEIVED " + message.toString() + " ***");
        switch (message.toString()) {
            case "cooling:on":
            blue_led.write(gpio.HIGH);
            break;
            case "cooling:off":
            blue_led.write(gpio.LOW);
            break;
            case "heating:on":
            red_led.write(gpio.HIGH);
            break;
            case "heating:off":
            red_led.write(gpio.LOW);
            break;
        }
    });
  
  
});

