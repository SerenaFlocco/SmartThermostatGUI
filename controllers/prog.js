var express = require('express')
var router = express.Router()
const syncfiles = require('../syncfiles.js');
const filename = 'settings.json';

// Authentication and Authorization Middleware
var auth = function(req, res, next) {
    const set = syncfiles.getSettings(filename);
    console.log(req.session)
    if (req.session && req.session.token === set.token)
      return next();
    else
      return res.redirect('/token');
  };

router.get('/',auth, function(req, res) {res.render('prog')})

module.exports = router