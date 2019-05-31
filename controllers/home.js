var express = require('express');
var piWifi = require('pi-wifi');
var router = express.Router();
var Wifi = require('rpi-wifi-connection');
var wifi = new Wifi();

// db
//router.use('/comments', require('./comments'))
//router.use('/users', require('./users'))

router.get('/', function(req, res) {
      // new library
      
 
    wifi.getStatus().then((status) => {
        console.log(status);
        res.render('index', {
          internet: status.ssid,
          ipAddress: status.ip_address
        });
    })
    .catch((error) => {
        console.log(error);
    });
})

module.exports = router