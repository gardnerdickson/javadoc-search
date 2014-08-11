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

  $scope.toggleMenu = function() {
    var body = $('.top-container');
    if (body.hasClass('menu-open')) {
      body.removeClass('menu-open');
    }
    else {
      body.addClass('menu-open');
    }
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

      matcherLocator.createMatcher(_.keys(classes), 'Basic');
      matcherLocator.createMatcher(_.keys(classes), 'CamelCase');

      $('.typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
          },
          {
            name: 'classes',
            displayKey: 'value',
            source: function(query, cb) {
              var basicMatches = matcherLocator.getMatcher('Basic').findMatches(query);
//              var camelCaseMatches = matcherLocator.getMatcher('CamelCase').findMatches(query);
//              searchResultObserver.update(basicMatches);

//              $timeout(function() {
//                $scope.searchResults = basicMatches;
//              }, 0);

              cb(basicMatches);
            }
          }).on('typeahead:selected', function($event, selection, datasetName) {
            var classMetadata = searchDataLocator.getSearchData(constants.metadata.CLASSES);
            $timeout(function() {
              loadJavadocClassPage(classMetadata[selection.value].url);
            }, 0);
          });

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

  function loadJavadocClassPage(relativeUrl) {
    var url = new URI(javadocUrl).segment(relativeUrl);
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString());
  }

  init();
}]);

