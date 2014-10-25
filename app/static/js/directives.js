
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
        scope.query = matches[searchResultMenu.selectedClassIndex];
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

app.directive('searchResultMenu', ['$log', '$timeout', 'searchDataLocator', 'javadocService', 'keyPressWatcher', 'constants', function($log, $timeout, searchDataLocator, javadocService, keyPressWatcher, constants) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResultMenu = {};

      var searchResultScopes = [];
      scope.SearchResultMenu.addSearchResult = function(scope) {
        searchResultScopes.push(scope);
      };

      scope.SearchResultMenu.removeSearchResult = function(scope) {
        searchResultScopes.splice(searchResultScopes.indexOf(scope), 1);
      };

      scope.SearchResultMenu.selectionMode = constants.selectionMode.CLASSES;

      scope.SearchResultMenu.updateResults = function(searchResults) {
        scope.SearchResultMenu.searchResults = searchResults;
        console.log("Search result directives: ", searchResultScopes.length);
      };

      scope.SearchResultMenu.selectedClassIndex = -1;
      scope.SearchResultMenu.selectedRelativeIndex = -1;

      keyPressWatcher.addHandler(keyPressWatcher.events.UP, function() {
        scope.$apply(function() {
          if (scope.SearchResultMenu.selectionMode == constants.selectionMode.CLASSES) {
            $log.log("decrementing selectedClassIndex");
            scope.SearchResultMenu.selectedClassIndex--;
            if (scope.SearchResultMenu.selectedClassIndex < 0) {
              scope.SearchResultMenu.selectedClassIndex = 0;
            }
          }
          else if (scope.SearchResultMenu.selectionMode == constants.selectionMode.RELATIVES) {
            var selectedSearchResult = searchResultScopes[scope.SearchResultMenu.selectedClassIndex];
            selectedSearchResult.selectedRelativeIndex--;
            if (selectedSearchResult.selectedRelativeIndex < 0) {
              selectedSearchResult.selectedRelativeIndex = 0;
            }
          }
        });
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.DOWN, function() {
        scope.$apply(function() {
          if (scope.SearchResultMenu.selectionMode == constants.selectionMode.CLASSES) {
            $log.log("incrementing selectedClassIndex");
            scope.SearchResultMenu.selectedClassIndex++;
            if (scope.SearchResultMenu.selectedClassIndex > scope.SearchResultMenu.searchResults.length - 1) {
              scope.SearchResultMenu.selectedClassIndex = scope.SearchResultMenu.searchResults.length - 1;
            }
          }
          else if (scope.SearchResultMenu.selectionMode == constants.selectionMode.RELATIVES) {
            var selectedSearchResult = searchResultScopes[scope.SearchResultMenu.selectedClassIndex];
            selectedSearchResult.selectedRelativeIndex++;
            if (selectedSearchResult.selectedRelativeIndex > selectedSearchResult.classRelatives.length - 1) {
              selectedSearchResult.selectedRelativeIndex = selectedSearchResult.classRelatives.length - 1;
            }
          }
        });
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.RIGHT, function() {
        scope.SearchResultMenu.selectionMode = constants.selectionMode.RELATIVES;
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.LEFT, function() {
        scope.SearchResultMenu.selectionMode = constants.selectionMode.CLASSES
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.ENTER, function() {
        scope.$apply(function() {
          scope.loadJavadocClassPage(scope.SearchResultMenu.searchResults[scope.SearchResultMenu.selectedClassIndex]);
          scope.SearchResultMenu.selectedClassIndex = -1;
        });
      });

      scope.SearchBox.setSearchResultMenu(scope.SearchResultMenu);

    }
  };
}]);


app.directive('searchResult', ['$log', 'searchDataLocator', 'javadocService', 'keyPressWatcher', 'constants', function($log, searchDataLocator, javadocService, keyPressWatcher, constants) {
  return {
    templateUrl: 'static/partials/search-result.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResult = {};

      scope.classRelatives = [];
      scope.showRelatives = false;

      var className = attrs.className;
      var uniqueId = _.uniqueId();
      var relativesLoaded = false;

      keyPressWatcher.addHandler(keyPressWatcher.events.LEFT, function() {
        var selectedClassName = scope.SearchResultMenu.searchResults[scope.SearchResultMenu.selectedClassIndex];
        if (className === selectedClassName) {
          scope.$apply(function() {
            scope.showRelatives = false;
          });
        }
      }, uniqueId);

      keyPressWatcher.addHandler(keyPressWatcher.events.RIGHT, function() {

        var selectedClassName = scope.SearchResultMenu.searchResults[scope.SearchResultMenu.selectedClassIndex];
        if (className === selectedClassName) {
          scope.$apply(function() {
            scope.showRelatives = true;
          });

          if (!relativesLoaded) {
            var classInfo = searchDataLocator.getSearchData('Classes')[className];

            javadocService.retrieveRelatives(new URI(classInfo.url).toString(), function(relatives) {
              scope.classRelatives = _.extend(_.keys(relatives.ancestors), _.keys(relatives.descendants));
              relativesLoaded = true;
            });
          }
        }
      }, uniqueId);


      scope.SearchResultMenu.addSearchResult(scope);

      element.on('$destroy', function() {
        keyPressWatcher.removeHandler(keyPressWatcher.events.UP, uniqueId);
        keyPressWatcher.removeHandler(keyPressWatcher.events.DOWN, uniqueId);
        keyPressWatcher.removeHandler(keyPressWatcher.events.LEFT, uniqueId);
        keyPressWatcher.removeHandler(keyPressWatcher.events.RIGHT, uniqueId);
        scope.SearchResultMenu.removeSearchResult(scope);
      });

    }
  }
}]);


app.directive('classRelative', [function() {
  return {
    templateUrl: 'static/partials/class-relative.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.loadClassRelative = function(name) {
        scope.loadJavadocClassPage(name);
      };

    }
  }
}]);
