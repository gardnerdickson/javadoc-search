'use strict';

app.controller('LoadUrlController', ['$scope', '$log', '$location', function($scope, $log, $location) {
  $scope.javadocUrl = null;

  $scope.loadJavadoc = function() {
    var normalizedUrl = normalizeUrl($scope.javadocUrl);
    $log.debug("Normalized URL: " + normalizedUrl);
    $location.path('/url/' + URI.encode(normalizedUrl));
  };

  function normalizeUrl(url) {
    var uri = new URI(url);

    if (uri.filename() === 'index.html') {
      uri.filename('');
    }

    if (uri.protocol() === '') {
      uri.protocol('http')
    }

    return uri.toString();
  }

  document.title = 'Javadoc Search';

}]);


app.controller('JavadocSearchController', ['$scope', '$log', '$routeParams', '$timeout', '$sce', '$q', '$http', 'javadocService', 'searchDataLocator', 'matcherLocator', 'keyPressWatcher', 'constants', function($scope, $log, $routeParams, $timeout, $sce, $q, $http, javadocService, searchDataLocator , matcherLocator, keyPressWatcher, constants) {
  var javadocVersion = null;
  var relativesCache = new LoadingCache({
    limit: 10,
    load: relativeCacheLoad
  });

  $scope.javadocUrl = null;
  $scope.loading = true;

  $scope.selectedSearchResult = null;
  $scope.searchMode = null;

  $scope.classRelativeResults = null;
  $scope.selectedClassRelative = null;

  $scope.searchResultMenuEnabled = false;
  $scope.relativeMenuEnabled = false;

  $scope.loadingRelatives = false;

  $scope.loadJavadocClassPage = function(className) {
    loadJavadocClassPage(searchDataLocator.getClassInfo()[className])
  };

  $scope.loadJavadocPackagePage = function(packageName) {
    loadJavadocPackagePage(searchDataLocator.getPackageInfo()[packageName]);
  };

  $scope.updateClassRelatives = function(relatives) {
    $scope.classRelativeResults = relatives;
    $scope.loadingRelatives = false;
  };

  $scope.$on('SELECTED_SEARCH_RESULT_CHANGED', function(event, searchResult) {
    $scope.selectedSearchResult = {
      value: searchResult,
      type: $scope.searchMode === 'Classes' ? 'Class' : 'Package'
    };
  });


  function init() {

    $scope.searchResultMenuEnabled = true;

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

  function retrieveClassRelatives() {
    if ($scope.searchMode !== 'Classes') {
      $log.info("Not loading relatives because search mode is ", $scope.searchMode);
      return;
    }

    relativesCache.get($scope.selectedSearchResult.value).then(function(relatives) {
      // TODO(gdickson): Checking $$phase is yucky.
      if (!$scope.$$phase) {
        $scope.$apply(function() {
          $scope.updateClassRelatives(relatives);
        })
      }
      else {
        $scope.updateClassRelatives(relatives);
      }
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
    $scope.searchResultMenuEnabled = true;
    $scope.relativeMenuEnabled = false;
  }

  function enableRelativeMenu() {
    $scope.searchResultMenuEnabled = false;
    $scope.relativeMenuEnabled = true;
  }

  function isRelativeMenuVisible() {
    return $('.top-container').hasClass('class-relative-menu-open');
  }

  function showRelativeMenu() {
    var topContainer = $('.top-container');
    if (!topContainer.hasClass('class-relative-menu-open')) {
      topContainer.addClass('class-relative-menu-open');
    }
  }

  function hideRelativeMenu() {
    var topContainer = $('.top-container');
    if (topContainer.hasClass('class-relative-menu-open')) {
      topContainer.removeClass('class-relative-menu-open');
    }
  }


  function relativeCacheLoad(key) {
    var classInfo = searchDataLocator.getClassInfo()[key];
    var url = new URI($scope.javadocUrl).segment(classInfo.url);

    return javadocService.retrieveRelatives(url.toString()).then(function(relatives) {
      return {
        ancestors: _.pluck(relatives.ancestors, 'className'),
        descendants: _.pluck(relatives.descendants, 'className')
      };
    });
  }


  keyPressWatcher.register({

    left: function() {
      $scope.$apply(function() {
        if (isRelativeMenuVisible()) {
          hideRelativeMenu();
        }
      });
    },

    right: function() {
      if ($scope.searchMode === 'Classes') {
        $scope.$apply(function() {

          if ($scope.selectedSearchResult === null) {
            return;
          }

          if ($scope.relativeMenuEnabled) {
            enableClassMenu();
          }

          if (!$scope.loadingRelatives) {
            $scope.loadingRelatives = true;
            retrieveClassRelatives();
          }

          showRelativeMenu();
        });
      }
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

