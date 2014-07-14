'use strict';

app.controller('MainCtrl', ['$scope', '$log', '$sce', '$timeout', 'constants', 'javadocService', 'searchDataLocator', 'matcherLocator', function($scope, $log, $sce, $timeout, constants, javadocService, searchDataLocator, matcherLocator) {

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
//              var basicMatches = matcherLocator.getMatcher('Basic').findMatches(query);
              var camelCaseMatches = matcherLocator.getMatcher('CamelCase').findMatches(query);

              cb(camelCaseMatches);
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

    javadocService.retrievePackages(encodedUrl, function(packages) {
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
    var url = new URI($scope.javadocUrl).segment(relativeUrl);
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString());
  }

}]);
