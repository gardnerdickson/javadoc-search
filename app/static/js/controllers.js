'use strict';

app.controller('MainCtrl', ['$scope', '$log', 'javadocService', function($scope, $log, javadocService) {

  $scope.javadocUrl = null;
  $scope.classes = null;
  $scope.loading = false;

  $scope.retrieveJavadocClasses = function() {
    $scope.loading = true;
    javadocService.retrieveClasses($scope.javadocUrl, function(classes) {
      $scope.classes = angular.toJson(classes);
      $scope.loading = false;
    });
  }


}]);
