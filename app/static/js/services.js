'use strict';

app.service('javadocService', ['$http', function($http) {

  var service = {};

  service.retrieveClasses = function(javadocUrl, onComplete) {
    var config = {
      params: {
        url: encodeURIComponent(javadocUrl)
      }
    };
    $http.get('./classes', config).then(function(response) {
      onComplete(response.data);
    });
  };

  return service;

}]);
