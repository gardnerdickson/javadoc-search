
app.directive('searchBox', ['$rootScope', '$log', 'matcherLocator', 'searchDataLocator', 'keyPressWatcher', function($rootScope, $log, matcherLocator, searchDataLocator, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/search-box.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      var basicClassesMatcher = null;
      var basicPackagesMatcher = null;
      var searchResultMenu = {};
      var lastQuery = null;
      var focus = false;
      var matches = [];

      scope.SearchBox_ = {};

      scope.SearchBox_.setSearchResultMenu = function(menu) {
        searchResultMenu = menu;
      };

      scope.$on('JavadocSearchController.focusSearchBox', function(event) {
        if (!focus) {
          // TODO(gdickson): focus text box without selecting the input element
          element.find('input').focus();
        }
      });

      //scope.$on('JavadocSearchController.blurSearchBox', function(event) {
      //  if (focus) {
      //    element.find('input').blur();
      //  }
      //});

      scope.$on('SELECTED_SEARCH_RESULT_CHANGED', function(event, selectedItem) {
        if (focus) {
          // TODO(gdickson): blur text box without selecting the input element
          $log.debug("Got event: " , event);
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
            openSearchResultMenu();
          }
        }
        else if (querySanitized === '') {
          $log.debug("Closing search result menu");
          closeSearchResultMenu();
        }

        try {
          if (scope.query.indexOf(':') === 0 && scope.query !== ':') {
            scope.searchMode = 'Packages';
            matches = basicPackagesMatcher.findMatches(querySanitized);
          }
          else {
            scope.searchMode = 'Classes';
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
          closeSearchResultMenu();
          var selectedSearchResultName = scope.selectedSearchResult.value;
          if (selectedSearchResultName !== null) {
            scope.query = selectedSearchResultName.replace(/#/g, '');
            if (scope.searchMode === 'Packages') {
              scope.query = ':' + scope.query;
            }
          }

          lastQuery = '';
        },

        esc: function() {
          scope.$apply(function() {
            closeSearchResultMenu();
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

      function openSearchResultMenu() {
        $('.top-container').addClass('search-result-menu-open');
      }

      function closeSearchResultMenu() {
        $('.top-container').removeClass('search-result-menu-open');
      }

    }
  }
}]);
