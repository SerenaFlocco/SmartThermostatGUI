var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('token', { title: 'token', layout: 'login' });

})

module.exports = router
