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
    loadJavadocClassPage(className);
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

      matcherLocator.createMatcher(_.keys(classes), 'Basic');
      matcherLocator.createMatcher(_.keys(classes), 'CamelCase');

      finished.classes = true;
      if (!_.contains(_.values(finished), false)) {
        onComplete();
      }
    });

    javadocService.retrievePackages(function(packages) {
      $log.debug("Got metadata for packages");
      searchDataLocator.setSearchData(packages, constants.metadata.PACKAGES);

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

  function loadJavadocClassPage(className) {
    var classInfo = searchDataLocator.getSearchData('Classes')[className];
    //var url = new URI(javadocUrl).segment(classInfo.url);
    //$scope.iframeSource = $sce.trustAsResourceUrl(url.toString());

    var url = new URI('./docPage').addSearch({classRelativeUrl: classInfo.url});
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString());
  }


  var javadocFrame = $('#javadoc-frame');
  javadocFrame.load(function() {
    var iframeBody = $(javadocFrame.contents().find('body'));
    iframeBody.find('.topNav').remove();
    iframeBody.find('.bottomNav').remove();
    iframeBody.find('.subNav').remove();

    var links = iframeBody.find('.contentContainer a');
    _.each(links, function(link) {
      link = $(link);
      var linkUrl = link.attr('href');
      link.attr('href', "javascript: parent.linkProxyRequest('" + linkUrl + "')")
    });

  });


  window.linkProxyRequest = function(relativeUrl) {
    relativeUrl = new URI(relativeUrl).hash("").toString().replace(/\.\.\//g, '');
    var url = new URI('/linkProxy').addSearch({classRelativeUrl: relativeUrl});
    $scope.$apply(function() {
      $scope.iframeSource = $sce.trustAsResourceUrl(url.toString());
    });
  };


  init();
}]);

