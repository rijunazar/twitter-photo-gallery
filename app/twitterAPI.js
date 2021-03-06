'use strict';

var utils = require('./utils'),
    OAuth = require('oauth').OAuth,
    config = require('./config/api.json');

function getURI(resource, params) {
    var host = config.host,
        version = config.version,
        resources = config.resources,
        url;

    return host + version + utils.formatURL(resources[resource], params);
}

function createOAuth(callbackUrl) {
    var oa,
        resourceUrl;

    return new OAuth(
        config.requestTokenURL,
        config.accessTokenURL,
        config.consumerKey,
        config.consumerSecret,
        '1.0',
        callbackUrl ? callbackUrl : null,
        'HMAC-SHA1'
    );
}


function TwitterAPI(config) {
    config = config || {};

    this.accessToken = config.accessToken;
    this.accessSecret = config.accessSecret;
    this.authToken = config.authToken;
    this.authSecret = config.authSecret;
    this.user = config.user || {};
}

TwitterAPI.prototype = {
    getRequestToken: function (callbackUrl, callback) {
        var oThis = this,
            oa = createOAuth(callbackUrl);

        oa.getOAuthRequestToken(function (e, token, secret) {
            var endPoint;

            if (!e) {
                endPoint =  utils.formatURL(config.authEndPoint, { token: token });
                oThis._setAuthToken(token, secret);
            }
            callback(e, token, secret, endPoint);
        });
    },

    _setAuthToken: function (token, secret) {
        this.authToken = token;
        this.authSecret = secret;
    },

    _setAccessToken: function (token, secret) {
        this.accessToken = token;
        this.accessSecret = secret;
    },

    fetchAccessToken: function (verifier, callback) {
        var oThis = this,
            oa = createOAuth();

        oa.getOAuthAccessToken(this.authToken, this.authSecret, verifier,
            function (e, token, secret, user) {
                if (!e) {
                    oThis._setAccessToken(token, secret);
                    oThis._setUserInfo(user.user_id, user.screen_name);
                }
                callback.apply(null, arguments);
            });
    },

    getFriendsList: function (cursor, callback) {
        this._getResource('friends', {
            cursor: cursor
        }, callback);
    },

    getProfile: function (callback) {
        this._getResource('profile', this.user, callback);
    },

    getTweets: function (config, callback) {
        this._getResource('tweets', config, function (err, tweets, respObj) {
            if (!err && config.hasMedia) {
                try {
                    tweets = JSON.parse(tweets);
                    tweets = tweets.filter(function (item) {
                        return Array.isArray(item.entities.media);
                    });
                } catch (e) {
                    console.log('unable to parse response, returning full result');
                }
            }
            callback.call(null, err, tweets, respObj);
        });
    },

    _getResource: function (name, params, callback) {

        var oa = createOAuth(),
            url;

        if (typeof params === "function") {
            callback = params;
            params = {};
        }

        url = getURI(name, params);
        console.log('requesting resource %s', url);
        oa.getProtectedResource(url, "GET", this.accessToken, this.accessSecret, callback);
    },

    hasValidToken: function () {
        return !!(this.accessToken && this.accessSecret && this.authToken &&
            this.authSecret);
    },

    _setUserInfo: function (id, name) {
        this.user.id = id;
        this.user.name = name;
    }
};

module.exports = exports = TwitterAPI;
