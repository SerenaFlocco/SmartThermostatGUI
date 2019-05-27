var express = require('express');
var piWifi = require('pi-wifi');
var router = express.Router();
var Wifi = require('rpi-wifi-connection');
var wifi = new Wifi();

// db
//router.use('/comments', require('./comments'))
//router.use('/users', require('./users'))

router.get('/', function(req, res) {
 
  
      /*piWifi.status('wlan0', function(err, status) {
  
        if (err) {return console.error(err.message);}
        
        if(status.wpa_state == 'INACTIVE')
          internet = "not connected";
        else if(status.wpa_state == 'COMPLETED'){
          internet = status.ssid;
          ip = status.ip;
        }
          
  
        res.render('index', {
          internet: internet,
          ipAddress: ip
        });
  
      });  */

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