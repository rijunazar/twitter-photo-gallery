(function (angular) {
    "use strict";

    var app = angular.module('twitterGalleryApp', []);
    
    app.controller('friendsListController', function (scope, http) {
        http.get('/api/friends/').success(function (data) {
            scope.friends = data;
        });
    });
    
})(window.angular);
