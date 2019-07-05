var express = require('express');
const syncfiles = require('../syncfiles.js');
const filename = 'settings.json';
var router = express.Router();

//if flag = 0 => redirect to token page, otherwise get the index page
var flag = 0;

router.get('/', function(req, res) {
   if(req.query.login === 'true')
      flag = 1;

   const settings = syncfiles.getSettings(filename);

   if(settings.mode == 'man') 
      mode = "manual";
   if(settings.mode == 'prog')
      mode = "program";
   if(settings.mode == 'off')
      mode = "off";
   if(settings.current_temperature != 0)
      temperature = settings.current_temperature.toFixed(1) + "°C";
   
   if(flag == 1) {
      res.render('index', {
         temperature: temperature,
         program: mode,
         season: settings.season,
      });
   } else {
      res.redirect('/token');
   }
   
});

module.exports = router
