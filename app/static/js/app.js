'use strict';

var app = angular.module('javadocSearch', ['ngRoute']);

app.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {

  $routeProvider
      .when('/', {
        templateUrl: 'static/partials/load-url.html',
        controller: 'LoadUrlController'
      })
      .when('/url/:url', {
        templateUrl: 'static/partials/javadoc-search.html',
        controller: 'JavadocSearchController'
      })
      .otherwise('/');

  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  $httpProvider.defaults.transformRequest = function(data) {
    if (data === undefined) {
      return data;
    }
    return $.param(data);
  };

}]);




