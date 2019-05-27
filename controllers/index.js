/**
 * It’s purpose is to load all other controllers and maybe 
 * define some paths which don’t have a common prefix like 
 * a home page route for example.
 */
var express = require('express');
var router = express.Router();
var exec      = require('child_process').exec;

router.use('/antifreeze', require('./antifreeze'));
router.use('/', require('./home'));
router.use('/prog', require('./prog'));
router.use('/weekend', require('./weekend'));
router.use('/wifi', require('./wifi'));

router.get('/demo', (req, res) => {res.render('demo')})

router.get('/error', function(req, res) {
    res.render('error', {
        message: "Generic error"
    })
})

router.get('/ok', function(req, res) {
    res.render('ok', {
        message: ";D"
    })
})

router.get('/poweroff', (req,res) => {
    console.log("poweroff");
    exec('shutdown now',(error,stdout,stderr) =>{ callback(stdout)});
})


module.exports = router