(function (angular) {
    "use strict";

    var app = angular.module('twitterGalleryApp', []);
    
    
    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/welcome', {
            templateUrl: 'partials/welcome.html',
            controller: 'welcome'
        }).when('/', {
            templateUrl: 'partials/main.html',
            controller: 'user'
        }).when('/friends/:id', {
            templateUrl: 'partials/main.html',
            controller: 'friendsGallery'
        }).otherwise({
            redirectTo: '/'
        });
    }]);

    app.controller('friendsList', function ($scope, $http) {
        
        $scope.templateURL = "partials/friends.html";
        $scope.isLoading = true;
        
        $http.get('/api/friends/').success(function (data) {
            $scope.friends = data.users;
            $scope.nextCursor = data.next_cursor;
            $scope.isLoading = false;
        });
    });
    
    app.controller('welcome', function ($scope, $http, $location) {
        $scope.home = '/';
    });
    
    
    app.controller('user', function ($scope, $http, $location, $rootScope) {
        $http.get('/api/profile/').success(function (user) {
            $scope.user = user;
            $rootScope.userId = user.id;
        }).error(function(data, status, headers, config) {
            if (status === 401) {
                $location.path('/welcome');
            }
        });
    });
    
    
    
})(window.angular);
