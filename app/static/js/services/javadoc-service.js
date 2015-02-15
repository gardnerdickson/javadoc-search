
app.service('javadocService', ['$q', '$http', function($q, $http) {

  var service = {};

  service.setBaseJavadocUrl = function(url) {
    var data = { baseUrl: url };

    var defer = $q.defer();
    $http.post('./baseUrl', data).then(function() {
      defer.resolve();
    });

    return defer.promise;
  };

  service.retrieveClasses = function(url) {
    console.log("Retrieving classes for url: ", url);
    var config = {
      params: { baseUrl: url }
    };

    var defer = $q.defer();
    $http.get('./classes', config).then(function(response) {
      defer.resolve(response.data);
    });

    return defer.promise;
  };

  service.retrievePackages = function(url) {
    var config = {
      params: { baseUrl: url }
    };

    var defer = $q.defer();
    $http.get('./packages', config).then(function(response) {
      defer.resolve(response.data);
    });

    return defer.promise;
  };

  service.retrieveMiscMetadata = function(url) {
    var config = {
      params: { baseUrl: url }
    };

    var defer = $q.defer();
    $http.get('./miscMetadata', config).then(function(response) {
      defer.resolve(response.data);
    });

    return defer.promise;
  };

  service.retrieveRelatives = function(url) {
    var config = {
      params: { classUrl: url }
    };

    var defer = $q.defer();
    $http.get('./relatives', config).then(function(response) {
      defer.resolve(response.data);
    });

    return defer.promise;
  };

  return service;
}]);
