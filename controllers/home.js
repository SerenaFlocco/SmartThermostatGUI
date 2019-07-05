var express = require('express');
const syncfiles = require('../syncfiles.js');
const filename = 'settings.json';
var router = express.Router();

//if flag = 0 => redirect to token page, otherwise get the index page
var flag = 0;

// Authentication and Authorization Middleware
var auth = function(req, res, next) {
   const set = syncfiles.getSettings(filename);
   console.log(req.session)
   if (req.session && req.session.token === set.token)
     return next();
   else
     return res.redirect('/token');
 };

router.get('/',auth, function(req, res) {
   /*if(req.query.login === 'true')
      flag = 1;*/

   const settings = syncfiles.getSettings(filename);

   if(settings.mode == 'man') 
      mode = "manual";
   if(settings.mode == 'prog')
      mode = "program";
   if(settings.mode == 'off')
      mode = "off";
   if(settings.current_temperature != 0)
      temperature = settings.current_temperature.toFixed(1) + "°C";
   
   //if(flag == 1) {
      res.render('index', {
         temperature: temperature,
         program: mode,
         season: settings.season,
      });
   /*} else {
      res.redirect('/token');
   }*/
   
});

module.exports = router
