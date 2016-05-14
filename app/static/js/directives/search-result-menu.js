
app.directive('searchResultMenu', ['$rootScope' ,'$log', 'keyPressWatcher', function($rootScope, $log, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.classes = [];
      scope.classMenuEnabled = false;

      var selectedItem = null;

      scope.$on('SEARCH_RESULTS_UPDATED', function(event, searchResults) {
        scope.classes = searchResults.slice();
      });

      scope.$on('SELECTED_SEARCH_RESULT_CHANGED', function(event, searchResult) {
        if (scope.classMenuEnabled) {
          selectedItem = searchResult;
        }
      });
      
      scope.$on('DESELECT_SEARCH_RESULT', function(event, searchResult) {
        selectedItem = null;
      });

      scope.$on('ENABLE_SEARCH_RESULT_MENU', function(event, value) {
        scope.classMenuEnabled = value;
      });


      keyPressWatcher.register({

        up: function() {
          if (!scope.classMenuEnabled) {
            return;
          }

          scope.$apply(function() {
            var selectedItemIndex = 0;
            if (selectedItem !== null) {
              selectedItemIndex = _.indexOf(scope.classes, selectedItem);
              selectedItemIndex--;
            }

            $rootScope.$broadcast('SELECTED_SEARCH_RESULT_CHANGED', scope.classes[selectedItemIndex]);
          });
        },

        down: function() {
          if (!scope.classMenuEnabled) {
            return;
          }

          scope.$apply(function() {
            var selectedItemIndex = 0;
            if (selectedItem !== null) {
              selectedItemIndex = _.indexOf(scope.classes, selectedItem);
              selectedItemIndex++;
            }
            $log.debug("trying to select item at index: ", selectedItemIndex);
            $rootScope.$broadcast('SELECTED_SEARCH_RESULT_CHANGED', scope.classes[selectedItemIndex]);
          });
        },

        enter: function() {
          scope.closeSearchResultMenu();
          scope.$apply(function() {
            if (scope.classMenuEnabled) {
              scope.searchMode === 'Class' ? scope.loadJavadocClassPage(selectedItem) : scope.loadJavadocPackagePage(selectedItem);
              selectedItem = null;
            }
          });
        }

      });

    }
  };
}]);
