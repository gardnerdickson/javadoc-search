
app.directive('searchBox', ['$rootScope', '$log', 'matcherLocator', 'searchDataLocator', 'keyPressWatcher', function($rootScope, $log, matcherLocator, searchDataLocator, keyPressWatcher) {
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

        if (basicClassesMatcher === null) {
          basicClassesMatcher = matcherLocator.getMatcher('Classes_Basic');
        }
        if (basicPackagesMatcher === null) {
          basicPackagesMatcher = matcherLocator.getMatcher('Packages_Basic');
        }

        var querySanitized = scope.query.replace(':', '');

        if (lastQuery === null || lastQuery === '') {
          if (scope.query !== '' && scope.query !== ':') {
            $log.debug("Opening search result menu");
            scope.openSearchResultMenu();
          }
        }
        else if (querySanitized === '') {
          $log.debug("Closing search result menu");
          scope.closeSearchResultMenu();
        }

        try {
          if (scope.query.indexOf(':') === 0 && scope.query !== ':') {
            scope.searchMode = 'Package';
            matches = basicPackagesMatcher.findMatches(querySanitized);
          }
          else {
            scope.searchMode = 'Class';
            matches = basicClassesMatcher.findMatches(querySanitized);
          }
        }
        catch (ignore) { }

        $rootScope.$broadcast('SEARCH_RESULTS_UPDATED', matches);

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
          scope.closeSearchResultMenu();
          var selectedSearchResultName = scope.selectedSearchResult.value;
          if (selectedSearchResultName !== null) {
            scope.query = selectedSearchResultName.replace(/#/g, '');
            if (scope.searchMode === 'Package') {
              scope.query = ':' + scope.query;
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

      });

    }
  }
}]);
