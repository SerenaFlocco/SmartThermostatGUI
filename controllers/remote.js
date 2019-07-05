var express = require('express');
var router = express.Router();
const filename = 'settings.json';
const syncfiles = require('../syncfiles.js');

router.get('/', function(req, res) {
   
    const settings = syncfiles.getSettings(filename);
    res.render('remote', {
        token: settings.token
    });
   
 });
 
 module.exports = router