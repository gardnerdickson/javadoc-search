
app.directive('searchBox', ['$rootScope', '$log', 'matcherLocator', 'javadocData', 'searchResultData', 'keyPressWatcher', function($rootScope, $log, matcherLocator, javadocData, searchResultData, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/search-box.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      var basicClassesMatcher = null;
      var basicPackagesMatcher = null;
      var lastQuery = null;
      var focus = false;
      var matches = [];

      scope.$on('FOCUS_SEARCH_BOX', function(event) {
        if (!focus) {
          element.find('input').focus();
        }
      });

      scope.$on('BLUR_SEARCH_BOX', function(event) {
        if (focus) {
          element.find('input').blur();
        }
      });

      scope.$on('SELECTED_SEARCH_RESULT_CHANGED', function(event, selectedItem) {
        if (focus) {
          element.find('input').blur();
        }
      });

      scope.onChange = function($event) {

        if (scope.selectedSearchResult !== null) {
          $rootScope.$broadcast('DESELECT_SEARCH_RESULT', scope.selectedSearchResult.value); // deselect current search result
        }

        if (basicClassesMatcher === null) {
          basicClassesMatcher = matcherLocator.getMatcher('Classes');
        }
        if (basicPackagesMatcher === null) {
          basicPackagesMatcher = matcherLocator.getMatcher('Packages');
        }

        var querySanitized = scope.query.replace(':', '');

        $log.debug("Query is: ", scope.query, " - Sanitized query is: ", querySanitized);

        if (lastQuery === null || lastQuery === '') {
          if (scope.query !== '' && scope.query !== ':') {
            $log.debug("Opening search result menu");
            scope.openSearchResultMenu();
          }
        }

        try {
          if (scope.query.indexOf(':') === 0) {
            scope.searchMode = 'Package';
            if (querySanitized === '') {
              $log.error("TODO: match all packages");
            }
            else {
              matches = basicPackagesMatcher.findMatches(querySanitized);
            }
          }
          else {
            scope.searchMode = 'Class';
            if (querySanitized === '') {
              matches = javadocData.getQualifiedClassNames();
            }
            else {
              matches = basicClassesMatcher.findMatches(querySanitized);
            }
          }
        }
        catch (ignore) { }

        $log.debug("[search-box] Updating filter with ", matches.length, "matches.");
        searchResultData.updateFilter(matches);
        $rootScope.$broadcast('SEARCH_RESULTS_UPDATED');
        $rootScope.$broadcast('ENABLE_SEARCH_RESULT_MENU', true);
        $rootScope.$broadcast('ENABLE_CLASS_RELATIVE_MENU', false);

        lastQuery = querySanitized;
      };

      scope.onFocus = function() {
        focus = true;
      };

      scope.onBlur = function() {
        focus = false;
      };


      keyPressWatcher.register({

        enter: function() {
          var selectedSearchResultName = scope.selectedSearchResult.value;
          if (selectedSearchResultName !== null) {
            if (scope.searchMode === 'Package') {
              scope.query = selectedSearchResultName;
              scope.query = ':' + scope.query;
            }
            else {
              // TODO(gdickson): Checking 'classInfo' is a workaround while method search results are being introduced.
              var classInfo = javadocData.getClassesByQualifiedClassName()[selectedSearchResultName];
              if (classInfo !== undefined) {
                scope.query = javadocData.getClassesByQualifiedClassName()[selectedSearchResultName].className;
              }
            }
          }

          lastQuery = '';
        },

        esc: function() {
          scope.$apply(function() {
            scope.closeSearchResultMenu();
            scope.closeClassRelativeMenu();
            scope.query = '';
            lastQuery = '';
          });
        },

        printable: function() {
          if (!focus) {
            element.find('input').focus();
            scope.query += String.fromCharCode(charCode);
            scope.onChange(null);
          }
        },

        backspace: function() {
          if (!focus) {
            element.find('input').focus();
            scope.query = scope.query.slice(0, scope.query.length - 2)
          }
        }

      }, 'searchBox');

    }
  }
}]);
