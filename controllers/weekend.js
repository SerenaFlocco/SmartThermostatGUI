var express = require('express')
var router = express.Router()

// db
//router.use('/comments', require('./comments'))
//router.use('/users', require('./users'))

router.get('/', function(req, res) {res.render('weekend')})

module.exports = router