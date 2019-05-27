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
      layout: 'main_no_options.handlebars'
    });
});

router.post('/connect', (req, res) => {
    piWifi.connect(req.body.ssid, req.body.password, function(err) {
      if (!err) {
        setTimeout(() => {
          console.log("timeout");
          /*piwifi.check(ssid, function (err, status) {
            if (!err && status.connected) {
              console.log('Connected to the network ' + ssid + '!');
              res.render('ok', {
                message: 'Connected to the network ' + ssid
              });
            } else {
              console.log('Unable to connect to the network ' + ssid + '!');
              res.render('error', {
                message: 'Unable to connect to the network ' + ssid
              });
            }
          });*/
          res.render('ok', {
            message: 'Connected to the network ' + ssid
          });
        }, 2000);
      }else{
        res.render('error', {
          message: "failed to connect on " + req.body.ssid + ": " + err
        })
        return console.error(err.message);
      }
      
    });
  })

module.exports = router