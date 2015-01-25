'use strict';

app.controller('LoadUrlController', ['$scope', '$log', '$location', function($scope, $log, $location) {
  $scope.javadocUrl = null;

  $scope.loadJavadoc = function() {

    var url = $scope.javadocUrl;
    if (url.indexOf('/index.html') !== -1) {
      url = url.replace('/index.html', '/')
    }

    var encodedUrl = URI.encode(url);
    $location.path('/url/' + encodedUrl);
  };

}]);


app.controller('JavadocSearchController', ['$scope', '$log', '$routeParams', '$timeout', '$sce', '$http', 'javadocService', 'searchDataLocator', 'matcherLocator', 'constants', function($scope, $log, $routeParams, $timeout, $sce, $http, javadocService, searchDataLocator , matcherLocator, constants) {
  var javadocUrl = null;
  var javadocVersion = null;

  $scope.loading = true;
  $scope.searchResults = null;

  $scope.loadJavadocClassPage = function(className) {
    loadJavadocClassPage(searchDataLocator.getClassInfo()[className])
  };

  $scope.loadJavadocPackagePage = function(packageName) {
    loadJavadocPackagePage(searchDataLocator.getPackageData()[packageName]);
  };


  function init() {

    javadocUrl = URI.decode($routeParams.url);

    javadocService.setBaseJavadocUrl(URI.encode(javadocUrl), function() {

      retrieveClassesAndPackages(function() {
        $log.debug("Done loading!!!");
        $scope.loading = false;
      });

      loadJavadocSite(javadocUrl);
    });
  }

  function retrieveClassesAndPackages(onComplete) {
    var finished = {
      classes: false,
      packages: false,
      version: false
    };

    javadocService.retrieveClasses(function(classes) {
      $log.debug("Got metadata for classes");

      searchDataLocator.setClassData(classes);

      //matcherLocator.createMatcher(_.keys(classes), 'Basic', 'Classes_Basic');
      //matcherLocator.createMatcher(_.keys(classes), 'CamelCase', 'Classes_CamelCase');

      matcherLocator.createMatcher(searchDataLocator.getClassNames(), 'Fuzzy', 'Classes_Basic');

      finished.classes = true;
      $scope.$broadcast('initialized.classes', classes);
      if (!_.contains(_.values(finished), false)) {
        onComplete();
      }
    });

    javadocService.retrievePackages(function(packages) {
      $log.debug("Got metadata for packages");
      searchDataLocator.setPackageData(packages);

      var packageNames = _.pluck(packages, 'packageName');
      matcherLocator.createMatcher(packageNames, 'Fuzzy', 'Packages_Basic');

      finished.packages = true;
      $scope.$broadcast('initialized.packages', packages);
      if (!_.contains(_.values(finished), false)) {
        onComplete();
      }
    });

    javadocService.getJavadocVersion(function(version) {
      $log.debug("Got javadoc version");
      javadocVersion = version;
      finished.version = true;
      if (!_.contains(_.values(finished), false)) {
        onComplete();
      }
    });
  }

  function loadJavadocSite(url) {
    url = new URI(url).segment('overview-summary.html');
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString())
  }

  function loadJavadocClassPage(classInfo) {

    var url = new URI(javadocUrl).segment(classInfo.url);
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString());
  }

  function loadJavadocPackagePage(packageInfo) {
    PackageFrameOnLoadHandler.path = packageInfo.url.replace('package-frame.html', ''); // TODO: Is there a nicer way of getting the package url??
    javadocFrame.bind('load', PackageFrameOnLoadHandler.onLoad);

    var url = new URI('/packagePageProxy').addSearch('packageRelativeUrl', packageInfo.url);
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString());
  }


  var javadocFrame = $('#javadoc-frame');
  var PackageFrameOnLoadHandler = {
    path: '',
    onLoad: function() {
      var iframeBody = $(javadocFrame.contents().find('body'));

      var links = [];
      if (javadocVersion['version'] === 'New') {
        links = iframeBody.find('.indexContainer a');
      }
      else {
        links = iframeBody.find('table tbody tr td a')
      }

      _.each(links, function(link) {
        link = $(link);
        var linkUrl = PackageFrameOnLoadHandler.path + link.attr('href');
        link.attr('href', "javascript: parent.setIframeSource('" + linkUrl + "')");

        javadocFrame.unbind('load');
      });
    }
  };


  window.onbeforeunload = function(e) {
    if (e.srcElement.activeElement.id === 'javadoc-frame') {
      return "You are about to leave Javadoc Search.";
    }
    return null;
  };


  window.setIframeSource = function(url) {
    $scope.$apply(function() {
      loadJavadocClassPage({url: url});
    });
  };


  $(function () {
    $('[data-toggle="popover"]').popover()
  });


  init();
}]);

