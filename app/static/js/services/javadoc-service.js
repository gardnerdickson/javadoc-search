
app.service('javadocService', ['$q', '$http', function($q, $http) {

  var service = {};

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

  service.retrieveRelatives = function(baseUrl, classUrl) {
    var config = {
      params: {
        baseUrl: baseUrl,
        classUrl: classUrl }
    };

    var defer = $q.defer();
    $http.get('./relatives', config).then(function(response) {
      defer.resolve(response.data);
    });

    return defer.promise;
  };

  service.retrieveClassMethods = function(baseUrl, classUrl) {
    var config = {
      params: {
        baseUrl: baseUrl,
        classUrl: classUrl
      }
    };

    var defer = $q.defer();
    $http.get('./classMethods', config).then(function(response) {
      defer.resolve(response.data)
    });

    return defer.promise;
  };

  return service;
}]);
