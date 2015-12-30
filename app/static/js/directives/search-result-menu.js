
app.directive('searchResultMenu', ['$rootScope' ,'$log', '$timeout', 'searchDataLocator', 'keyPressWatcher', function($rootScope, $log, $timeout, searchDataLocator, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResultMenu = {};

      scope.SearchBox_.setSearchResultMenu(scope.SearchResultMenu);

      scope.items = [];

      var selectedItem = null;


      scope.$on('SEARCH_RESULTS_UPDATED', function(event, searchResults) {
        scope.items = searchResults.slice();
      });

      scope.$on('SELECTED_SEARCH_RESULT_CHANGED', function(event, searchResult) {
        if (scope.searchResultMenuEnabled) {
          selectedItem = searchResult;
        }
      });


      keyPressWatcher.register({

        up: function() {
          if (!scope.searchResultMenuEnabled) {
            return;
          }

          scope.$apply(function() {
            var selectedItemIndex = 0;
            if (selectedItem !== null) {
              selectedItemIndex = _.indexOf(scope.items, selectedItem);
              selectedItemIndex--;
            }

            $rootScope.$broadcast('SELECTED_SEARCH_RESULT_CHANGED', scope.items[selectedItemIndex]);
          });
        },

        down: function() {
          if (!scope.searchResultMenuEnabled) {
            return;
          }

          scope.$apply(function() {
            var selectedItemIndex = 0;
            if (selectedItem !== null) {
              selectedItemIndex = _.indexOf(scope.items, selectedItem);
              selectedItemIndex++;
            }

            $rootScope.$broadcast('SELECTED_SEARCH_RESULT_CHANGED', scope.items[selectedItemIndex]);
          });
        },

        enter: function() {
          scope.$apply(function() {
            if (scope.searchResultMenuEnabled) {
              scope.searchMode === 'Classes' ? scope.loadJavadocClassPage(selectedItem) : scope.loadJavadocPackagePage(selectedItem);
              selectedItem = null;
            }
          });
        }

      });

    }
  };
}]);
