'use strict';

app.service('javadocService', ['$http', function($http) {

  var service = {};

  service.retrieveClasses = function(javadocUrl, onComplete) {
    var config = {
      params: { url: encodeURIComponent(javadocUrl) }
    };
    $http.get('./classes', config).then(function(response) {
      onComplete(response.data);
    });
  };

  service.retrievePackages = function(javadocUrl, onComplete) {
    var config = {
      params: { url: encodeURIComponent(javadocUrl) }
    };
    $http.get('./packages', config).then(function(response) {
      onComplete(response.data);
    });
  };

  return service;

}]);


app.service('constants', [function() {
  var service = {};

  service.metadata = {
    CLASSES: 'Classes',
    PACKAGES: 'Packages'
  };

  service.tryValidateMetadataType = function(type) {
    if (type != service.metadata.CLASSES && type != service.metadata.PACKAGES) {
      throw 'Invalid type: ' + type;
    }
  };

  return service;
}]);


app.service('searchDataLocator', ['constants', function(constants) {

  var service = {};

  var searchData = {};

  service.setSearchData = function(searchData, type) {
    constants.tryValidateMetadataType(type);
    searchData[type] = searchData;
  };

  service.getSearchData = function(type) {
    constants.tryValidateMetadataType(type);
    return searchData[type];
  };

  return service;
}]);


app.service('indexLocator', ['constants', function(constants) {

  var service = {};

  function Index(data) {
    // TODO: subclasses for class search and package search.
  }



}]);
