'use strict';

app.controller('LoadUrlController', ['$scope', '$log', '$location', function($scope, $log, $location) {
  $log.log("LoadUrlController");

  $scope.javadocUrl = null;

  $scope.loadJavadoc = function() {
    var encodedUrl = URI.encode($scope.javadocUrl);
    $location.path('/url/' + encodedUrl);
  };

}]);

app.controller('JavadocSearchController', ['$scope', '$log', '$routeParams', '$timeout', '$sce', 'javadocService', 'searchDataLocator', 'matcherLocator', 'constants', function($scope, $log, $routeParams, $timeout, $sce, javadocService, searchDataLocator , matcherLocator, constants) {
  $log.log("JavadocSearchController");

  var javadocUrl = null;

  $scope.loading = true;
  $scope.searchResults = null;


  $scope.loadJavadocClassPage = function(classInfo) {
    $log.info("Loading class page: ", classInfo);
    var url = new URI(javadocUrl).segment(classInfo.url);
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString());
  };


  function init() {

    javadocUrl = $routeParams.url;

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

      matcherLocator.createMatcher(classes, 'Basic');
      matcherLocator.createMatcher(classes, 'CamelCase');

      finished.classes = true;
      if (!_.contains(_.values(finished), false)) {
        onComplete();
      }
    });

    javadocService.retrievePackages(function(packages) {
      $log.debug("Got metadata for packages");
      searchDataLocator.setSearchData(packages, constants.metadata.PACKAGES);
//      matcherLocator.createMatcher(_.keys(packages), constants.metadata.PACKAGES);

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

  init();
}]);

