(function (angular) {
    "use strict";

    var app = angular.module('twitterGalleryApp', []);
    
    app.controller('friendsList', function ($scope, $http) {
        
        $scope.templateURL = "partials/friends.html";
        $scope.isLoading = true;
        
        $http.get('/api/friends/').success(function (data) {
            $scope.friends = data.users;
            $scope.nextCursor = data.next_cursor;
            $scope.isLoading = false;
        });
    });
    
    
    app.controller('user', function ($scope, $http) {
        $http.get('/api/profile/').success(function (user) {
            $scope.user = user;
        });
    });
    
})(window.angular);
