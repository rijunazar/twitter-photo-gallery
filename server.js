'use strict';
var express = require('express'),
    apiController = require('./app/apiController.js'),
    port = 8080;

var app = express();

app.use('/', express.static('./public'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
    secret: 'twitterphotoapp'
}));
var api = new apiController();
app.use('/api', api.init());

app.listen(port);

console.log("static server listening to port ", port);
