var express = require('express');
var settings = require('../settings.json');
var router = express.Router();

router.get('/', function(req, res) {
   var mode;
   var temperature;

   if(settings.mode == 'man') 
	mode = "manual";
   if(settings.mode == 'prog')
	mode = 'program';
   if(settings.current_temperature != 0)
   temperature = settings.current_temperature.toFixed(1) + "°C";
   
   res.render('index', {
      temperature: temperature,
      program: mode,
      season: settings.season,
   });

})

module.exports = router
