'use strict';
var OAuth = require('oauth').OAuth;

function makeRequest(config, cb) {
    var oauth = new OAuth('https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        config.consumerKey,
        config.consumerSecret,
        '1.0A',
        null,
        'HMAC-SHA1');
   
//    console.inspect(oauth);
    oauth.getOAuthRequestToken(function () {console.log(arguments)});
 
}


module.exports.getAuthToken = (function (cb) {
    var config = require('./apiConfig.json');

    makeRequest(config, function (err, resp) {
        console.log(arguments);
        if (!err) {
            console.log(resp);
        }
    });
}) ();
