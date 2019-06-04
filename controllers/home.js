var express = require('express');
var piWifi = require('pi-wifi');
var settings = require('../settings.json');
var router = express.Router();
var Wifi = require('rpi-wifi-connection');
var wifi = new Wifi();
const mac = require('getmac');

// db
//router.use('/comments', require('./comments'))
//router.use('/users', require('./users'))

router.get('/', function(req, res) {
   var mode;
   var temperature;

   if(settings.mode == 'man') 
	mode = "manual";
   if(settings.mode == 'prog')
	mode = 'program';
   if(settings.current_temperature != 0)
   temperature = settings.current_temperature.toFixed(1) + "°C";
   
   
   
   wifi.getStatus().then((status) => {
        console.log(status);

      mac.getMac(function(err, macAddress){
         if (err)  throw err
         console.log(macAddress);
      });

      res.render('index', {
         temperature: temperature,
         program: mode,
         season: settings.season,
         internet: status.ssid,
         ipAddress: status.ip_address
      });
	
         
   })
   .catch((error) => {
      console.log(error);
   });
})

module.exports = router
