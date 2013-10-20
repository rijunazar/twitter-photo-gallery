'use strict';

var express = require('express'),
    qs = require('querystring'),
    twitterAPI = require('./twitterAPI');

function validateSession(req, resp) {
    var apiObj = req.session.apiObj = new twitterAPI(req.session.apiObj);

    if (!apiObj.hasValidToken()) {
        resp.redirect('/api/authenticate/?ref=' + qs.escape(req.url));
    }
}

function Controller() {
    this._app = null;
    this.init();
}

Controller.prototype = {
    bindRoutes: function () {
        var app = this._app;
        app.get('/friends/:id', this.getFriends);
        app.get('/authenticate', this.authenticate);
        app.get('/profile', this.getProfile);
        app.get('/session', this.startSession);
        app.get('/friends/:id/gallery', this.getGallery);
        app.get('/gallery', this.getGallery);
    },

    init: function () {
        this._app = express();
        this.bindRoutes();
        return this._app;
    },

    getProfile: function (req, resp) {

        validateSession.apply(this, arguments);
        var apiObj = req.session.apiObj;

        apiObj.getProfile(function (e, data, apiResp) {
            resp.set(apiResp.headers);
            resp.send(apiResp.statusCode, data)
        });
    },

    getFriends: function (req, resp) {
        validateSession.apply(this, arguments);
    },

    authenticate: function (req, resp) {
        var refUrl = req.param('ref'),
            cbUrl = req.protocol + "://" + req.get('host') + '/api/session/',
            apiObj;

        apiObj = req.session.apiObj = new twitterAPI();
        if (refUrl) {
            cbUrl += "?r=" + qs.escape(refUrl);
        }

        apiObj.getRequestToken(cbUrl, function (error, token, secret) {
            resp.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + token);
        });
    },

    startSession: function (req, resp) {
        var apiObj = req.session.apiObj = new twitterAPI(req.session.apiObj),
            verifier = req.query.oauth_verifier;

        console.log(apiObj);

        apiObj.fetchAccessToken(verifier, function (e, token, secret, params) {
            resp.redirect('/api/profile');
        });
    },

    getGallery: function (req, resp) {
        validateSession.apply(this, arguments);
    }
};

module.exports = exports = Controller;
