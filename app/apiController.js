'use strict';

var express = require('express'),
    qs = require('querystring'),
    twitterAPI = require('./twitterAPI'),
    maxAge = 60 * 10;

/* middleware for validating session */
function validateSession(req, resp, next) {
    var apiObj = req.session.apiObj = new twitterAPI(req.session.apiObj);

    if (apiObj.hasValidToken()) {
        next();
    } else if (req.xhr) {
        resp.send(401, {message: "Unauthorized access"});
    } else { //todo: for testing api, remove in prod
        resp.redirect('/api/authenticate/?ref=' + qs.escape(req.originalUrl));
    }
}

/* controller class */

function Controller() {
    this._app = null;
    this.init();
}

Controller.prototype = {
    bindRoutes: function () {
        var app = this._app;
        app.get('/friends/:id', validateSession, this.getFriends);
        app.get('/friends', validateSession, this.getFriends);
        app.get('/authenticate', this.authenticate);
        app.get('/profile', validateSession, this.getProfile);
        app.get('/session', this.startSession);
        app.get('/friends/:id/tweets', validateSession, this.getTweets);
        app.get('/tweets', validateSession, this.getTweets);
    },

    init: function () {
        this._app = express();
        this.bindRoutes();
        return this._app;
    },

    getProfile: function (req, resp) {

        var apiObj = req.session.apiObj;

        apiObj.getProfile(function (e, data, apiResp) {
            resp.set(apiResp.headers);
            resp.send(apiResp.statusCode, data);
        });
    },

    getFriends: function (req, resp) {
        var apiObj = req.session.apiObj;

        apiObj.getFriendsList(req.query.cursor || -1, function (e, data, apiResp) {
            //resp.set(apiResp.headers);
            resp.type(apiResp.headers['content-type']);
            resp.setHeader('Cache-Control', 'public, max-age=' + maxAge);
            resp.send(apiResp.statusCode, data);
        });
    },

    authenticate: function (req, resp) {
        var refUrl = req.query.ref,
            cbUrl = req.protocol + "://" + req.get('host') + '/api/session/',
            apiObj;

        apiObj = req.session.apiObj = new twitterAPI();
        if (refUrl) {
            cbUrl += "?r=" + qs.escape(refUrl);
        }

        apiObj.getRequestToken(cbUrl, function (error, token, secret, endpoint) {
            resp.redirect(endpoint);
        });
    },

    startSession: function (req, resp) {
        var apiObj = req.session.apiObj = new twitterAPI(req.session.apiObj),
            verifier = req.query.oauth_verifier,
            redirectURL = req.query.r || '/api/profile';

        apiObj.fetchAccessToken(verifier, function (e, token, secret, params) {
            resp.redirect(redirectURL);
        });
    },

    getTweets: function (req, resp) {
        var apiObj = req.session.apiObj,
            id = req.param('id'),
            hasMedia = (req.query.hasMedia === 'true'),
            config;

        config = {
            id: id,
            hasMedia: hasMedia
        };

        apiObj.getTweets(config, function (e, data, apiResp) {
            resp.set(apiResp.headers);
            resp.send(apiResp.statusCode, data);
        });
    }
};

module.exports = exports = Controller;
