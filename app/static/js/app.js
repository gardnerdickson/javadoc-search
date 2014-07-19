'use strict';

var app = angular.module('javadocSearch', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
      .when('/', {
        templateUrl: 'app/templates/load-url.html',
        controller: 'LoadUrlController'
      })
      .when('/url', {
        templateUrl: 'app/templates/javadoc-search.html',
        controller: 'JavadocSearchController'
      })
      .otherwise('/')
}]);

