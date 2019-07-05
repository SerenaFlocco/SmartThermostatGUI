var express = require('express');
var router = express.Router();

router.get('/token', function(req, res) {

    res.render('view', { title: 'token', layout: 'login' });

})

module.exports = router
