
app.directive('searchBox', ['$log', 'matcherLocator', 'searchDataLocator', 'keyPressWatcher', function($log, matcherLocator, searchDataLocator, keyPressWatcher) {
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

        scope.updateSearchResults(matches);

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

          var selectedSearchResult = searchResultMenu.getSelectedSearchResult();
          if (selectedSearchResult !== null) {
            scope.query = selectedSearchResult.replace(/#/g, '');
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