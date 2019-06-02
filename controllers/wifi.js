var express = require('express');
//var piWifi = require('pi-wifi');
var Wifi = require('rpi-wifi-connection');
var wifi = new Wifi();
var router = express.Router();


// db
//router.use('/comments', require('./comments'))
//router.use('/users', require('./users'))

router.get('/', (req, res) => {  
    // new library 
    /*wifi.scan().then((ssids) => {
      console.log(ssids);


      res.render('wifi', {
        avNetworks: ssids
        });


    }).catch((error) => {
      console.log(error);
      res.render('error', {
        message: "failed to load wifi access points:" + error
      });
    });*/

    wifi.getNetworks().then((networks) => {
      console.log(networks);
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
  wifi.connect({ssid: req.body.ssid, psk: req.body.password}).then(() => {
    console.log('Connected to network.');
    res.render('ok', {
      message: 'Connected to the network ' + req.body.ssid
    });
  })
  .catch((error) => {
      console.log(error);
      res.render('error', {
        message: "Failed to connect on " + req.body.ssid
      })
  });
  
  })

module.exports = router
