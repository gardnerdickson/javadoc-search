'use strict';

app.controller('MainCtrl', ['$scope', '$log', 'constants', 'javadocService', 'searchDataLocator', 'indexLocator', function($scope, $log, constants, javadocService, searchDataLocator, indexLocator) {

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
      console.log('Classes: ', classes);
      searchDataLocator.setSearchData(classes, constants.metadata.CLASSES);
      indexLocator.createIndex(_.keys(classes), constants.metadata.CLASSES);
      console.log('Class Tree: ', indexLocator.getIndex(constants.metadata.CLASSES));

      finished.classes = true;
      if (!_.contains(_.values(finished), false)) {
        $scope.loading = false;
      }
    });

    javadocService.retrievePackages($scope.javadocUrl, function(packages) {
      console.log('Packages:', packages);
      searchDataLocator.setSearchData(packages, constants.metadata.PACKAGES);
      indexLocator.createIndex(_.keys(packages), constants.metadata.PACKAGES);
      console.log('Package Tree: ', indexLocator.getIndex(constants.metadata.PACKAGES));

      finished.packages = true;
      if (!_.contains(_.values(finished), false)) {
        $scope.loading = false;
      }
    });

  };

  $scope.retrieveJavadocClassRelatives = function() {
    $scope.loading = true;

    var url = new URI($scope.javadocUrl);
    url.segment($scope.classRelativeUrl);

    javadocService.retrieveRelatives(url.toString(), function(relatives) {
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
