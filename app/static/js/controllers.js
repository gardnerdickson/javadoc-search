'use strict';

app.controller('MainCtrl', ['$scope', '$log', 'constants', 'javadocService', 'searchDataLocator', function($scope, $log, constants, javadocService, searchDataLocator) {

  $scope.javadocUrl = null;
  $scope.classRelativeUrl = null;
  $scope.display = null;
  $scope.loading = false;

  $scope.retrieveJavadocClasses = function() {
    $scope.loading = true;
    javadocService.retrieveClasses($scope.javadocUrl, function(classes) {
      $scope.display = angular.toJson(classes);
      $scope.loading = false;

      searchDataLocator.setSearchData(classes, constants.metadata.CLASSES);
    });
  };

  $scope.retrieveJavadocPackages = function() {
    $scope.loading = true;
    javadocService.retrievePackages($scope.javadocUrl, function(packages) {
      $scope.display = angular.toJson(packages);
      $scope.loading = false;

      searchDataLocator.setSearchData(packages, constants.metadata.PACKAGES);
    });
  };

  $scope.retrieveJavadocClassRelatives = function() {
    $scope.loading = true;
    var url = $scope.javadocUrl + '/' + $scope.classRelativeUrl;
    javadocService.retrieveRelatives(url, function(relatives) {
      $scope.display = angular.toJson(relatives);
      $scope.loading = false;
    });
  };

}]);
