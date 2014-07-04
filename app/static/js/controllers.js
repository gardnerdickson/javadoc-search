'use strict';

app.controller('MainCtrl', ['$scope', '$log', 'constants', 'javadocService', 'searchDataLocator', 'indexLocator', function($scope, $log, constants, javadocService, searchDataLocator, indexLocator) {

  $scope.javadocUrl = null;
  $scope.classRelativeUrl = null;
  $scope.loading = false;

  $scope.retrieveJavadocClassesAndPackages = function() {
    var finished = {
      classes: false,
      packages: false
    };

    $scope.loading = true;

    var encodedUrl = URI.encode($scope.javadocUrl);

    javadocService.retrieveClasses(encodedUrl, function(classes) {
      searchDataLocator.setSearchData(classes, constants.metadata.CLASSES);
      indexLocator.createIndex(_.keys(classes), constants.metadata.CLASSES);

      $scope.classes = _.keys(classes);

      $scope.display = angular.toJson(searchDataLocator.getSearchData(constants.metadata.CLASSES), true);

      finished.classes = true;
      if (!_.contains(_.values(finished), false)) {
        $scope.loading = false;
      }
    });

    javadocService.retrievePackages(encodedUrl, function(packages) {
      searchDataLocator.setSearchData(packages, constants.metadata.PACKAGES);
      indexLocator.createIndex(_.keys(packages), constants.metadata.PACKAGES);

      finished.packages = true;
      if (!_.contains(_.values(finished), false)) {
        $scope.loading = false;
      }
    });

  };

  $scope.retrieveJavadocClassRelatives = function() {
    $scope.loading = true;

    var url = new URI($scope.javadocUrl).segment($scope.classRelativeUrl);
    var encodedUrl = URI.encode(url.toString());

    javadocService.retrieveRelatives(encodedUrl, function(relatives) {
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
