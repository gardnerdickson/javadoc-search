
app.directive('searchBox', ['$log', 'matcherLocator', 'searchDataLocator', 'keyPressWatcher', 'searchResultManager', function($log, matcherLocator, searchDataLocator, keyPressWatcher, searchResultManager) {
  return {
    templateUrl: 'static/partials/search-box.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      var searchResultMenu = {};
      var focus = false;

      scope.SearchBox_ = {};

      scope.SearchBox_.searchMode = 'Classes';

      scope.SearchBox_.setSearchResultMenu = function(menu) {
        searchResultMenu = menu;
      };

      scope.onChange = function($event) {

        var matches = searchResultManager.search(scope.query);

        var lastQuery = searchResultManager.getLastQuery();
        if (lastQuery === '') {
          closeSearchResultMenu();
        }
        else {
          openSearchResultMenu();
        }

        searchResultMenu.updateResults(matches);
      };

      scope.onFocus = function() {
        focus = true;
      };

      scope.onBlur = function() {
        focus = false;
      };


      searchResultManager.registerSearchResultSelectWatcher(function(searchResult) {
        closeSearchResultMenu();

        scope.$apply(function() {
          if (searchResultManager.getSearchMode() === 'Classes') {
            scope.query = searchResult.className.replace(/#/g, '');
          }
          else {
            scope.query = searchResult.packageName.replace(/#/g, '');
            scope.query = ':' + scope.query;
          }
        });

      });


      keyPressWatcher.register({

        esc: function() {
          scope.$apply(function() {
            closeSearchResultMenu();
            scope.query = '';
          });
        },

        printable: function(charCode) {
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

      // TODO: should use ng-class here instead of flipping classes
      function openSearchResultMenu() {
        $('.top-container').addClass('search-result-menu-open');
      }

      function closeSearchResultMenu() {
        $('.top-container').removeClass('search-result-menu-open');
      }

    }
  }
}]);
