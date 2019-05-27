var express = require('express');
var piWifi = require('pi-wifi');
var router = express.Router();


// db
//router.use('/comments', require('./comments'))
//router.use('/users', require('./users'))

router.get('/', (req, res) => {
    // list all the available networks
    piWifi.scan(function(err, networks) {
      if (err) {
        return console.error(err.message);
      }
      //console.log(networks);
      //var obj = JSON.parse(networks);
      if(networks.result == "FAIL-BUSY")
      res.render('error', {
                message: "failed to load wifi access points: SERVICE BUSY"
          });
      else
      //load the html page
      res.render('wifi', {
      avNetworks: networks
      });
    });
});

router.get('/:ssid', (req, res) => {
  
    let ssid = req.params.ssid;
    res.render('wifi_ssid', {
      ssid: ssid,
    });
});

router.post('/connect', (req, res) => {
  piWifi.status('wlan0', function(err, status) {
    if (err) {return console.error(err.message);}
    if(status.wpa_state == 'COMPLETED'){  // If the system is connected 
      piWifi.disconnect(function(err) {     // disconnect it
        if (err) {return console.error(err.message);}
        console.log('Disconnected from network!');
        // connect it 
        piWifi.connect(req.body.ssid, req.body.password, function(err) {
          if (!err) {
              res.render('ok', {
                message: 'Connected to the network ' + ssid
              });
	    return
          }else{
            res.render('error', {
              message: "failed to connect on " + req.body.ssid 
            })
            return console.error(err.message);
          }
        });
      });
    }else{//otherwise 
      piWifi.connect(req.body.ssid, req.body.password, function(err) {
        if (!err) {
            res.render('ok', {
              message: 'Connected to the network ' + ssid
            });
        }else{
          res.render('error', {
            message: "failed to connect on " + req.body.ssid + ": " + err
          })
          return console.error(err.message);
        }
      });
    }
  });
  
  

    
  })

module.exports = router
