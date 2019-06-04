const raspi = require('raspi');
const gpio = require('raspi-gpio');
 
raspi.init(() => {
  
  const red_led = new gpio.DigitalOutput('GPIO7');
  const blue_led = new gpio.DigitalOutput('GPIO8');
 
  red_led.write(gpio.HIGH);
  blue_led.write(gpio.HIGH);
});