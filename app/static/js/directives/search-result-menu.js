
app.directive('searchResultMenu', ['$rootScope' ,'$log', '$timeout', 'searchDataLocator', 'keyPressWatcher', function($rootScope, $log, $timeout, searchDataLocator, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.items = [];
      scope.enabled = false;
      scope.menuName = attrs['menuName'];

      $log.log("Created menu with name: ", scope.menuName);

      var selectedItem = null;

      scope.$on('SEARCH_RESULTS_UPDATED', function(event, searchResults) {
        if (scope.enabled) {
          scope.items = searchResults.slice();
        }
      });

      scope.$on('SELECTED_SEARCH_RESULT_CHANGED', function(event, searchResult) {
        if (scope.enabled) {
          selectedItem = searchResult;
        }
      });

      scope.$on('ENABLE_SEARCH_RESULT_MENU', function(event, menuName) {
        scope.enabled = scope.menuName === menuName;
        $log.log("Enabled search result menu is: ", scope.menuName);
      });


      keyPressWatcher.register({

        up: function() {

          $log.log(scope.menuName, " is enabled: ", scope.enabled);

          if (!scope.enabled) {
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

          $log.log(scope.menuName, " is enabled: ", scope.enabled);

          if (!scope.enabled) {
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
            if (scope.enabled) {
              scope.searchMode === 'Class' ? scope.loadJavadocClassPage(selectedItem) : scope.loadJavadocPackagePage(selectedItem);
              selectedItem = null;
            }
          });
        }

      });

    }
  };
}]);
