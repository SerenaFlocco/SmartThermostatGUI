var express = require('express');
const syncfiles = require('../syncfiles.js');
const filename = 'settings.json';
var router = express.Router();

router.get('/', function(req, res) {
   var mode;
   var temperature;

   const settings = syncfiles.getSettings(filename);

   if(settings.mode == 'man') 
	   mode = "manual";
   if(settings.mode == 'prog')
      mode = "program";
   if(settings.mode == 'off')
      mode = "off";
   if(settings.current_temperature != 0)
      temperature = settings.current_temperature.toFixed(1) + "°C";
   
   res.render('index', {
      temperature: temperature,
      program: mode,
      season: settings.season,
   });

})

module.exports = router
