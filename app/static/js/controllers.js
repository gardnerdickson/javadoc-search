'use strict';

app.controller('MainCtrl', ['$scope', '$log', 'constants', 'javadocService', 'searchDataLocator', function($scope, $log, constants, javadocService, searchDataLocator) {

  $scope.javadocUrl = null;
  $scope.display = null;
  $scope.loading = false;

  $scope.retrieveJavadocClasses = function() {
    $scope.loading = true;
    javadocService.retrieveClasses($scope.javadocUrl, function(classes) {
      $scope.display = angular.toJson(classes);
      $scope.loading = false;

      searchDataLocator.setSearchData(classes, constants.CLASSES);
    });
  };

  $scope.retrieveJavadocPackages = function() {
    $scope.loading = true;
    javadocService.retrievePackages($scope.javadocUrl, function(packages) {
      $scope.display = angular.toJson(packages);
      $scope.loading = false;

      searchDataLocator.setSearchData(packages, constants.PACKAGES);
    });
  };

}]);
