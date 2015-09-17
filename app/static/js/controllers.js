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

  document.title = 'Javadoc Search';

}]);


app.controller('JavadocSearchController', ['$scope', '$log', '$routeParams', '$timeout', '$sce', '$q', '$http', 'javadocService', 'searchDataLocator', 'matcherLocator', 'keyPressWatcher', 'constants', function($scope, $log, $routeParams, $timeout, $sce, $q, $http, javadocService, searchDataLocator , matcherLocator, keyPressWatcher, constants) {
  var javadocVersion = null;

  $scope.javadocUrl = null;
  $scope.loading = true;

  $scope.searchResults = null;
  $scope.selectedSearchResult = null;

  $scope.classMenuEnabled = false;
  $scope.relativeMenuEnabled = false;

  $scope.loadJavadocClassPage = function(className) {
    loadJavadocClassPage(searchDataLocator.getClassInfo()[className])
  };

  $scope.loadJavadocPackagePage = function(packageName) {
    loadJavadocPackagePage(searchDataLocator.getPackageData()[packageName]);
  };

  $scope.updateSearchResults = function(results) {
    $scope.searchResults = [];
    _.each(results, function(result) {
      $scope.searchResults.push({name: result})
    });
  };

  $scope.$watch('selectedSearchResult', function() {
    $log.log('Selected search result changed to ', $scope.selectedSearchResult);
  });


  function init() {

    $scope.classMenuEnabled = true;

    $scope.javadocUrl = new URI(URI.decode($routeParams.url)).normalize().toString();
    if ($scope.javadocUrl.charAt($scope.javadocUrl.length - 1) !== '/') {
      $scope.javadocUrl += '/';
    }

    javadocService.setBaseJavadocUrl($scope.javadocUrl).then(function() {

      retrieveClassesAndPackages().then(function() {
        $log.debug("Done loading!!!");
        $scope.loading = false;
      });

      loadJavadocSite($scope.javadocUrl);
    });
  }

  function retrieveClassesAndPackages() {

    var classesPromise = javadocService.retrieveClasses($scope.javadocUrl);
    var packagePromise = javadocService.retrievePackages($scope.javadocUrl);
    var miscMetadataPromise = javadocService.retrieveMiscMetadata($scope.javadocUrl);

    return $q.all([classesPromise, packagePromise, miscMetadataPromise]).then(function(results) {
      var classes = results[0];
      var packages = results[1];
      var miscMetadata = results[2];
      javadocVersion = miscMetadata['version']; // Controller scope level variable

      document.title = miscMetadata['title'] + ' - Javadoc Search';

      $log.debug("Got metadata for classes: ", classes);
      $log.debug("Got metadata for packages: ", packages);
      $log.debug("Got misc metadata: ", miscMetadata);

      searchDataLocator.setClassData(classes);
      searchDataLocator.setPackageData(packages);

      matcherLocator.createMatcher(searchDataLocator.getClassNames(), 'Fuzzy', 'Classes_Basic');
      matcherLocator.createMatcher(searchDataLocator.getPackageNames(), 'Fuzzy', 'Packages_Basic');

      $scope.$broadcast('initialized.classes', classes);
      $scope.$broadcast('initialized.packages', packages);
    });
  }

  function loadJavadocSite(url) {
    url = new URI(url).segment('overview-summary.html');
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString())
  }

  function loadJavadocClassPage(classInfo) {
    var url = new URI($scope.javadocUrl).segment(classInfo.url);
    $log.debug("Setting iframe source to ", url.toString());
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString());
  }

  function loadJavadocPackagePage(packageInfo) {
    PackageFrameOnLoadHandler.path = packageInfo.url.replace('package-frame.html', ''); // TODO: Is there a nicer way of getting the package url??
    javadocFrame.bind('load', PackageFrameOnLoadHandler.onLoad);

    var url = new URI('/packagePageProxy').addSearch('baseUrl', $scope.javadocUrl).addSearch('packageUrl', packageInfo.url);
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString());
  }

  function enableClassMenu() {
    $scope.classMenuEnabled = true;
    $scope.relativeMenuEnabled = false;
  }

  function enableRelativeMenu() {
    $scope.classMenuEnabled = false;
    $scope.relativeMenuEnabled = true;
  }


  keyPressWatcher.register({

    enter: function() {
      $scope.$apply(function() {
        if ($scope.selectedSearchResult.type === 'Class') {
          $log.debug("Loading javadoc class page.");
          $scope.loadJavadocClassPage($scope.selectedSearchResult.value)
        }
        else {
          $log.debug("Loading package page.");
          $scope.loadJavadocPackagePage($scope.selectedSearchResult.value);
        }
      });
    },

    left: function() {
      $scope.$apply(function() {
        if ($scope.classMenuEnabled) {
          enableRelativeMenu();
        }
      });
    },

    right: function() {
      $scope.$apply(function() {
        if ($scope.relativeMenuEnabled) {
          enableClassMenu();
        }
      });
    }

  });


  var javadocFrame = $('#javadoc-frame');
  var PackageFrameOnLoadHandler = {
    path: '',
    onLoad: function() {
      var iframeBody = $(javadocFrame.contents().find('body'));

      var links = [];
      if (javadocVersion === 'New') {
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

