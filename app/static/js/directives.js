
app.directive('searchBox', ['$log', 'matcherLocator', 'searchDataLocator', 'keyPressWatcher', function($log, matcherLocator, searchDataLocator, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/search-box.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      var basicMatcher = null;
      var searchResultMenu = {};
      var lastQuery = null;
      var focus = false;
      var matches = [];

      scope.SearchBox = {};

      scope.SearchBox.setSearchResultMenu = function(menu) {
        searchResultMenu = menu;
      };

      scope.onChange = function($event) {

        if (lastQuery === null || lastQuery === '') {
          openSearchResultMenu();
        }
        else if (scope.query === '') {
          closeSearchResultMenu();
        }

        if (basicMatcher === null) {
          basicMatcher = matcherLocator.getMatcher('Basic');
        }

        try { matches = basicMatcher.findMatches(scope.query); }
        catch (exception) { /* suppress */ }

        searchResultMenu.updateResults(matches);

        lastQuery = scope.query;
      };

      scope.onFocus = function() {
        focus = true;
      };

      scope.onBlur = function() {
        focus = false;
      };

      keyPressWatcher.addHandler(keyPressWatcher.events.ENTER, function() {
        closeSearchResultMenu();
        scope.query = matches[searchResultMenu.selectedIndex];
        lastQuery = '';
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.ESC, function() {
        scope.$apply(function() {
          closeSearchResultMenu();
          scope.query = '';
          lastQuery = '';
        });
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.PRINTABLE, function(charCode) {
        if (!focus) {
          element.find('input').focus();
          scope.query += String.fromCharCode(charCode);
          scope.onChange(null);
        }
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.BACKSPACE, function() {
        if (!focus) {
          element.find('input').focus();
          scope.query = scope.query.slice(0, scope.query.length - 2)
        }
      });

      function openSearchResultMenu() {
        $('.top-container').addClass('menu-open');
      }

      function closeSearchResultMenu() {
        $('.top-container').removeClass('menu-open');
      }

    }
  }
}]);

app.directive('searchResultMenu', ['$log', '$timeout', 'searchDataLocator', 'javadocService', 'keyPressWatcher', function($log, $timeout, searchDataLocator, javadocService, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResultMenu = {};

      scope.SearchResultMenu.updateResults = function(searchResults) {
        scope.SearchResultMenu.searchResults = searchResults;
      };

      scope.SearchResultMenu.selectedIndex = -1;

      keyPressWatcher.addHandler(keyPressWatcher.events.UP, function() {
        scope.$apply(function() {
          scope.SearchResultMenu.selectedIndex--;
          if (scope.SearchResultMenu.selectedIndex < 0) {
            scope.SearchResultMenu.selectedIndex = 0;
          }
        });
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.DOWN, function() {
        scope.$apply(function() {
          scope.SearchResultMenu.selectedIndex++;
          if (scope.SearchResultMenu.selectedIndex > scope.SearchResultMenu.searchResults.length - 1) {
            scope.SearchResultMenu.selectedIndex = scope.SearchResultMenu.searchResults.length - 1;
          }
        });
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.ENTER, function() {
        scope.$apply(function() {
          scope.loadJavadocClassPage(scope.SearchResultMenu.searchResults[scope.SearchResultMenu.selectedIndex]);
          scope.SearchResultMenu.selectedIndex = -1;
        });
      });

      scope.SearchBox.setSearchResultMenu(scope.SearchResultMenu);

    }
  };
}]);


app.directive('searchResult', ['$log', 'searchDataLocator', 'javadocService', 'keyPressWatcher', function($log, searchDataLocator, javadocService, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/search-result.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResult = {};

      scope.ancestors = [];
      scope.descendants = [];

      var className = attrs.className;
      var uniqueId = _.uniqueId();

      keyPressWatcher.addHandler(keyPressWatcher.events.UP, function() {
        scope.$apply(function() {
          clearClassRelatives();
        });
      }, uniqueId);

      keyPressWatcher.addHandler(keyPressWatcher.events.DOWN, function() {
        scope.$apply(function() {
          clearClassRelatives();
        });
      }, uniqueId);

      keyPressWatcher.addHandler(keyPressWatcher.events.LEFT, function() {
        scope.$apply(function() {
          var selectedClassName = scope.SearchResultMenu.searchResults[scope.SearchResultMenu.selectedIndex];
          if (className === selectedClassName) {
            clearClassRelatives();
          }
        });
      }, uniqueId);

      keyPressWatcher.addHandler(keyPressWatcher.events.RIGHT, function() {
        $log.log('Caught the RIGHT event');
        var selectedClassName = scope.SearchResultMenu.searchResults[scope.SearchResultMenu.selectedIndex];
        if (className === selectedClassName) {
          var classInfo = searchDataLocator.getSearchData('Classes')[className];
          $log.log('Trying to get search data: ', classInfo);

          javadocService.retrieveRelatives(new URI(classInfo.url).toString(), function(relatives) {
            scope.ancestors = _.keys(relatives.ancestors);
            scope.descendants = _.keys(relatives.descendants);
          });
        }
      }, uniqueId);


      function clearClassRelatives() {
        while (scope.ancestors.length > 0) {
          scope.ancestors.pop();
        }
        while (scope.descendants.length > 0) {
          scope.descendants.pop();
        }
      }

      element.on('$destroy', function() {
        keyPressWatcher.removeHandler(keyPressWatcher.events.UP, uniqueId);
        keyPressWatcher.removeHandler(keyPressWatcher.events.DOWN, uniqueId);
        keyPressWatcher.removeHandler(keyPressWatcher.events.LEFT, uniqueId);
        keyPressWatcher.removeHandler(keyPressWatcher.events.RIGHT, uniqueId);
      });

    }
  }
}]);
