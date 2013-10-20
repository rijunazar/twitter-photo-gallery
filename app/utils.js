'use strict';

var urlFormatReqExp = /\$[a-z0-9_]*/gi;

function formatURL(url, paramsObj) {
    url = String(url);
    paramsObj = paramsObj || {};

    return url.replace(urlFormatReqExp, function (match) {
        var param = match.substr(1);
        return (typeof paramsObj[param] === 'undefined') ? '' : paramsObj[param];
    });
}

module.exports.formatURL = formatURL;
