var express = require('express');
var piWifi = require('pi-wifi');
var router = express.Router();

// db
//router.use('/comments', require('./comments'))
//router.use('/users', require('./users'))

router.get('/', function(req, res) {
    var _status;
    var internet;
    var ip = '-';
  
      piWifi.status('wlan0', function(err, status) {
  
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
  
    });  
})

module.exports = router