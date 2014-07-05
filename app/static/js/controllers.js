'use strict';

app.controller('MainCtrl', ['$scope', '$log', '$sce', 'constants', 'javadocService', 'searchDataLocator', 'indexLocator', function($scope, $log, $sce, constants, javadocService, searchDataLocator, indexLocator) {

  var viewModes = {
    ENTER_URL: 'EnterUrl',
    LOADING_JAVADOC: 'LoadingJavadoc',
    JAVADOC_LOADED: 'JavadocLoaded'
  };

  $scope.viewMode = viewModes.ENTER_URL;
  $scope.javadocUrl = null;

  $scope.retrieveJavadocClassesAndPackages = function() {

    $scope.viewMode = viewModes.LOADING_JAVADOC;

    loadClassesAndPackages(URI.encode($scope.javadocUrl) ,function() {
      $scope.viewMode = viewModes.JAVADOC_LOADED;
    });

    loadJavadocSite($scope.javadocUrl);
  };

  $scope.retrieveJavadocClassRelatives = function() {
    var url = new URI($scope.javadocUrl).segment($scope.classRelativeUrl);
    var encodedUrl = URI.encode(url.toString());

    javadocService.retrieveRelatives(encodedUrl, function(relatives) {
      $scope.display = angular.toJson(relatives);
    });
  };

  $scope.test = function() {
    console.log("AppletContext < Applet", "AppletContext" < "Applet");
    console.log("ArrayList < List", "ArrayList" < "List");
    console.log("Collection < Thread", "Collection" < "Thread");
  };


  function loadClassesAndPackages(encodedUrl, onComplete) {

    var finished = {
      classes: false,
      packages: false
    };

    javadocService.retrieveClasses(encodedUrl, function(classes) {
      searchDataLocator.setSearchData(classes, constants.metadata.CLASSES);
      indexLocator.createIndex(_.keys(classes), constants.metadata.CLASSES);

      $scope.classes = _.keys(classes);

      $scope.display = angular.toJson(searchDataLocator.getSearchData(constants.metadata.CLASSES), true);

      finished.classes = true;
      if (!_.contains(_.values(finished), false)) {
        onComplete();
      }
    });

    javadocService.retrievePackages(encodedUrl, function(packages) {
      searchDataLocator.setSearchData(packages, constants.metadata.PACKAGES);
      indexLocator.createIndex(_.keys(packages), constants.metadata.PACKAGES);

      finished.packages = true;
      if (!_.contains(_.values(finished), false)) {
        onComplete();
      }
    });
  }

  function loadJavadocSite(url) {
    $scope.iframeSource = $sce.trustAsResourceUrl(url)
  }

}]);
