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


app.controller('JavadocSearchController', ['$scope', '$log', '$routeParams', '$timeout', '$sce', '$q', '$http', 'javadocService', 'javadocData', 'searchResultData', 'matcherLocator', 'keyPressWatcher', 'constants', function($scope, $log, $routeParams, $timeout, $sce, $q, $http, javadocService, javadocData, searchResultData, matcherLocator, keyPressWatcher, constants) {
  var javadocVersion = null;
  var relativesCache = new LoadingCache({
    limit: 10,
    load: relativeCacheLoad
  });

  $scope.javadocUrl = null;
  $scope.loading = true;

  $scope.selectedSearchResult = null;
  $scope.searchMode = null;

  $scope.selectedClassRelative = null;

  $scope.relativeMenuEnabled = false;

  $scope.loadingRelatives = false;

  $scope.loadJavadocClassPage = function(className) {
    loadJavadocClassPage(javadocData.getClassesByQualifiedClassName()[className])
  };

  $scope.loadJavadocPackagePage = function(packageName) {
    loadJavadocPackagePage(javadocData.getPackageInfo()[packageName]);
  };

  $scope.loadJavadocConstructorAnchor = function(constructorSignature) {
    loadJavadocMethodAnchor(javadocData.getConstructorInfo()[constructorSignature]);
  };

  $scope.loadJavadocMethodAnchor = function(methodSignature) {
    loadJavadocMethodAnchor(javadocData.getMethodInfo()[methodSignature]);
  };


  $scope.toggleSearchResultMenu = function() {
    var topContainer = $('.top-container');
    if (!topContainer.hasClass('search-result-menu-open')) {
      topContainer.addClass('search-result-menu-open');
      $scope.$broadcast('SEARCH_RESULTS_UPDATED')
    }
    else {
      topContainer.removeClass('search-result-menu-open');
    }
  };

  $scope.openSearchResultMenu = function() {
    var topContainer = $('.top-container');
    if (!topContainer.hasClass('search-result-menu-open')) {
      topContainer.addClass('search-result-menu-open');
    }
  };

  $scope.closeSearchResultMenu = function() {
    $('.top-container').removeClass('search-result-menu-open');
  };

  $scope.openClassRelativeMenu = function() {
    var topContainer = $('.top-container');
    if (!topContainer.hasClass('class-relative-menu-open')) {
      topContainer.addClass('class-relative-menu-open');
    }
  };

  $scope.closeClassRelativeMenu = function() {
    $('.top-container').removeClass('class-relative-menu-open');
  };

  $scope.$on('SELECTED_SEARCH_RESULT_CHANGED', function(event, searchResult) {
    $scope.selectedSearchResult = {
      value: searchResult,
      type: $scope.searchMode
    };
  });

  $scope.searchResultArrowClicked = function(item) {
    $log.debug("Arrow clicked for: ", item);
    if (isRelativeMenuVisible()) {
      $scope.closeClassRelativeMenu();
      enableClassMenu();
    }
    else {
      if (!$scope.loadingRelatives) {
        $scope.loadingRelatives = true;
        retrieveClassRelatives();
      }
      $scope.openClassRelativeMenu();
      enableRelativeMenu();
    }
  };


  function init() {
    $scope.javadocUrl = new URI(URI.decode($routeParams.url)).normalize().toString();
    if ($scope.javadocUrl.charAt($scope.javadocUrl.length - 1) !== '/') {
      $scope.javadocUrl += '/';
    }

    retrieveClassesAndPackages().then(function() {
      $log.debug("Done loading!!!");
      $scope.loading = false;
    });

    loadJavadocSite($scope.javadocUrl);
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

      javadocData.setClassData(classes);
      javadocData.setPackageData(packages);
      searchResultData.setResults(javadocData.getQualifiedClassNames());

      matcherLocator.createMatcher(javadocData.getClassNames(), javadocData.getQualifiedClassNames(), 'ElasticLunr', 'Classes');
      matcherLocator.createMatcher(javadocData.getPackageNames(), javadocData.getPackageNames(), 'Fuzzy', 'Packages');

      $scope.$broadcast('ENABLE_SEARCH_RESULT_MENU');
      $scope.searchMode = 'Class'; // TODO(gdickson): This is a hack until this variable can be removed altogether.
      $scope.$broadcast('CLASSES_LOADED', javadocData.getQualifiedClassNames())
    });
  }

  function retrieveClassRelatives() {
    if ($scope.searchMode !== 'Class') {
      $log.info("Not loading relatives because search mode is ", $scope.searchMode);
      return;
    }

    var classInfo = javadocData.getClassesByQualifiedClassName()[$scope.selectedSearchResult.value];
    var relativesPromise = javadocService.retrieveRelatives($scope.javadocUrl, classInfo.url);
    var constructorPromise = javadocService.retrieveClassConstructors($scope.javadocUrl, classInfo.url);
    var methodPromise = javadocService.retrieveClassMethods($scope.javadocUrl, classInfo.url);

    $q.all([relativesPromise, constructorPromise, methodPromise]).then(function(results) {
      var relatives = results[0];
      var constructors = results[1];
      var methods = results[2];

      javadocData.setConstructorData(constructors);
      javadocData.setMethodData(methods);

      $scope.loadingRelatives = false;
      $scope.$broadcast('UPDATE_CLASS_RELATIVES_MENU', relatives, constructors, methods);
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

    var url = new URI('/javadocPageProxy').addSearch('baseUrl', $scope.javadocUrl).addSearch('pageUrl', packageInfo.url);
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString());
  }

  function loadJavadocMethodAnchor(methodInfo) {
    var methodPath = methodInfo.url;
    while (methodPath.startsWith('../')) {
      methodPath = methodPath.replace('../', '');
    }
    var url = new URI($scope.javadocUrl + methodPath);
    $scope.iframeSource = $sce.trustAsResourceUrl(url.toString());
  }

  function enableClassMenu() {
    $scope.$broadcast('ENABLE_SEARCH_RESULT_MENU', true);
    $scope.$broadcast('ENABLE_CLASS_RELATIVE_MENU', false);
  }

  function enableRelativeMenu() {
    $scope.$broadcast('ENABLE_CLASS_RELATIVE_MENU', true);
    $scope.$broadcast('ENABLE_SEARCH_RESULT_MENU', false);
  }

  function isRelativeMenuVisible() {
    return $('.top-container').hasClass('class-relative-menu-open');
  }

  function relativeCacheLoad(key) {
    var classInfo = javadocData.getClassesByQualifiedClassName()[key];
    return javadocService.retrieveRelatives($scope.javadocUrl, classInfo.url).then(function(relatives) {
      var indexByFunction = function(classInfo) {
        return classInfo['package'] + '.' + classInfo['className'];
      };
      return {
        ancestors: _.indexBy(relatives.ancestors, indexByFunction),
        descendants: _.indexBy(relatives.descendants, indexByFunction)
      };
    });
  }


  keyPressWatcher.register({

    left: function() {
      $scope.$apply(function() {
        if (isRelativeMenuVisible()) {
          $scope.closeClassRelativeMenu();
          enableClassMenu();
        }
      });
    },

    right: function() {
      if ($scope.searchMode === 'Class') {
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
          $scope.openClassRelativeMenu();
          enableRelativeMenu();
        });
      }
    }

  }, 'mainController');


  var javadocFrame = $('#javadoc-frame');
  var PackageFrameOnLoadHandler = {
    path: '',
    onLoad: function() {
      var iframeHead = $(javadocFrame.contents().find('head'));
      var stylesheetProxy = './javadocPageProxy?baseUrl=' + URI.encode($scope.javadocUrl) + '&pageUrl=stylesheet.css&mimeType=' + URI.encode('text/css');
      iframeHead.append('<link rel="stylesheet" type="text/css" href="' + stylesheetProxy + '">');

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

