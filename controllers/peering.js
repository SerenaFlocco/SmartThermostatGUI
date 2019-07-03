var express = require('express');
var piWifi = require('pi-wifi');
var settings = require('../settings.json');
var router = express.Router();
var Wifi = require('rpi-wifi-connection');
var wifi = new Wifi();


router.get('/', function(req, res) {
   
   wifi.getStatus().then((status) => {
      console.log(status);
      res.render('peering', {
         ipAddress: status.ip_address
      });
	
         
   })
   .catch((error) => {
      console.log(error);
   });
})

module.exports = router
