'use strict';

var app = angular.module('javadocSearch', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
      .when('/', {
        templateUrl: 'static/partials/load-url.html',
        controller: 'LoadUrlController'
      })
      .when('/url/:url', {
        templateUrl: 'static/partials/javadoc-search.html',
        controller: 'JavadocSearchController'
      })
      .otherwise('/')
}]);

