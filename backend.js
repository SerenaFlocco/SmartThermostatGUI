const express = require('express');
const app = express();
var application_root = __dirname;

app.use('frontend/css/', express.static(__dirname + '/frontend/css/'));
app.use('frontend/font/', express.static(__dirname + '/frontend/font/'));
app.use('frontend/iconfont/', express.static(__dirname + '/frontend/iconfont/'));
app.use('frontend/js/', express.static(__dirname + '/frontend/js/'));
app.use('frontend/scss/', express.static(__dirname + '/frontend/scss/'));
app.use('frontend/solar/', express.static(__dirname + '/frontend/solar/'));
app.use(express.static(application_root));

app.get('/', (req, res) => {
    res.sendFile('/index.html', {application_root});
});

app.listen(3000, () => console.log('App listening on port 3000...'));

/** 
 * Web socket backend: listen on mqtt topic-->when a msg is received, send it to the frontend
*/