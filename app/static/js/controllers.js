'use strict';

app.controller('MainCtrl', ['$scope', '$log', 'constants', 'javadocService', 'searchDataLocator', function($scope, $log, constants, javadocService, searchDataLocator) {

  $scope.javadocUrl = null;
  $scope.classRelativeUrl = null;
  $scope.display = null;
  $scope.loading = false;

  $scope.retrieveJavadocClassesAndPackages = function() {
    var finished = {
      classes: false,
      packages: false
    };

    $scope.loading = true;

    javadocService.retrieveClasses($scope.javadocUrl, function(classes) {
      $scope.display = angular.toJson(classes);
      searchDataLocator.setSearchData(classes, constants.metadata.CLASSES);

      finished.classes = true;
      if (!_.contains(_.values(finished), false)) {
        $scope.loading = false;
      }
    });

    javadocService.retrievePackages($scope.javadocUrl, function(packages) {
      $scope.display = angular.toJson(packages);
      searchDataLocator.setSearchData(packages, constants.metadata.PACKAGES);

      finished.packages = true;
      if (!_.contains(_.values(finished), false)) {
        $scope.loading = false;
      }
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

  $scope.test = function() {
    console.log("AppletContext < Applet", "AppletContext" < "Applet");
    console.log("ArrayList < List", "ArrayList" < "List");
    console.log("Collection < Thread", "Collection" < "Thread");
  };

}]);
