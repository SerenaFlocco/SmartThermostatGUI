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
    wifi.scan().then((ssids) => {
      //console.log(ssids);
    var noDuplicates = []; // used for comparrisons
    var noDuplicatesObj = []; // used to store objects
    ssids.forEach(function(item){
      if(!noDuplicates.includes(item.ssid)){
        console.log({ssid: item.ssid});
        noDuplicates.push(item.ssid);
        noDuplicatesObj.push({ssid: item.ssid});
      }
    });
    res.render('wifi', {
            avNetworks: noDuplicatesObj
          });

    }).catch((error) => {
      console.log(error);
      res.render('error', {
        message: "failed to load wifi access points:" + error
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
