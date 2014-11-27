'use strict';

app.controller('LoadUrlController', ['$scope', '$log', '$location', function($scope, $log, $location) {
  $scope.javadocUrl = null;

  $scope.loadJavadoc = function() {
    var encodedUrl = URI.encode($scope.javadocUrl);
    $location.path('/url/' + encodedUrl);
  };

}]);


app.controller('JavadocSearchController', ['$scope', '$log', '$routeParams', '$timeout', '$sce', '$http', 'javadocService', 'searchDataLocator', 'matcherLocator', 'constants', function($scope, $log, $routeParams, $timeout, $sce, $http, javadocService, searchDataLocator , matcherLocator, constants) {
  var javadocUrl = null;

  $scope.loading = true;
  $scope.searchResults = null;


  $scope.loadJavadocClassPage = function(className) {
    loadJavadocPage(searchDataLocator.getSearchData('Classes')[className]);
  };

  $scope.loadJavadocPackagePage = function(packageName) {
    loadJavadocPage(searchDataLocator.getSearchData('Packages')[packageName]);
  };

  function init() {

    javadocUrl = URI.decode($routeParams.url);

    javadocService.setBaseJavadocUrl(URI.encode(javadocUrl), function() {

      retrieveClassesAndPackages(function() {
        $scope.loading = false;
      });

      loadJavadocSite(javadocUrl);
    });
  }

  function retrieveClassesAndPackages(onComplete) {
    var finished = {
      classes: false,
      packages: false
    };

    javadocService.retrieveClasses(function(classes) {
      $log.debug("Got metadata for classes");
      searchDataLocator.setSearchData(classes, constants.metadata.CLASSES);

      matcherLocator.createMatcher(_.keys(classes), 'Basic', 'Classes_Basic');
      matcherLocator.createMatcher(_.keys(classes), 'CamelCase', 'Classes_CamelCase');

      finished.classes = true;
      if (!_.contains(_.values(finished), false)) {
        onComplete();
      }
    });

    javadocService.retrievePackages(function(packages) {
      $log.debug("Got metadata for packages");
      searchDataLocator.setSearchData(packages, constants.metadata.PACKAGES);

      matcherLocator.createMatcher(_.keys(packages), 'Basic', 'Packages_Basic');

      finished.packages = true;
      if (!_.contains(_.values(finished), false)) {
        onComplete();
      }
    });
  }

  function loadJavadocSite(url) {
    url = new URI(url).segment('overview-summary.html');
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString())
  }


  function loadJavadocPage(moduleInfo) {
    var url = new URI(javadocUrl).segment(moduleInfo.url);
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString());
  }


  window.onbeforeunload = function() {
    return "You are about to leave Javadoc Search."
  };


  init();
}]);

