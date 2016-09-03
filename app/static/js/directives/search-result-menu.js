
app.directive('searchResultMenu', ['$rootScope' ,'$log', 'keyPressWatcher', function($rootScope, $log, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    restrict: 'A',
    controller: function($scope, $element) {
      $scope.resultItems = {};
      this.addResultItem = function(resultItemScope) {
        $scope.resultItems[resultItemScope.item] = resultItemScope;
      };
    },
    link: function(scope, element, attrs, controller) {

      scope.classes = [];
      scope.classMenuEnabled = false;

      var selectedItem = null;

      scope.$on('SEARCH_RESULTS_UPDATED', function(event, searchResults) {
        scope.classes = searchResults.slice();
      });

      scope.$on('DESELECT_SEARCH_RESULT', function(event, searchResult) {
        selectedItem = null;
      });

      scope.$on('ENABLE_SEARCH_RESULT_MENU', function(event, value) {
        scope.classMenuEnabled = value;
        if (scope.classMenuEnabled && selectedItem !== null) {
          scope.resultItems[selectedItem].select();
        }
      });

      scope.loadPage = function(item) {
        $log.debug("Loading selected item: ", item);
        scope.searchMode === 'Class' ? scope.loadJavadocClassPage(item) : scope.loadJavadocPackagePage(item);
      };


      controller.selectItemFromHover = function(item) {
        if (!scope.classMenuEnabled) {
          return;
        }
        var selectedItemIndex;
        if (selectedItem !== null) {
          selectedItemIndex = _.indexOf(scope.classes, selectedItem);
          scope.resultItems[scope.classes[selectedItemIndex]].deselect();
        }
        selectedItemIndex = _.indexOf(scope.classes, item);
        selectedItem = scope.classes[selectedItemIndex];
        scope.resultItems[selectedItem].select();
      };


      keyPressWatcher.register({

        up: function() {
          if (!scope.classMenuEnabled) {
            return;
          }

          scope.$apply(function() {
            var selectedItemIndex = 0;
            if (selectedItem !== null) {
              selectedItemIndex = _.indexOf(scope.classes, selectedItem);
              scope.resultItems[scope.classes[selectedItemIndex]].deselect();
              selectedItemIndex = selectedItemIndex - 1 >= 0 ? selectedItemIndex - 1 : 0;
            }

            selectedItem = scope.classes[selectedItemIndex];
            scope.resultItems[selectedItem].select();
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
              scope.resultItems[scope.classes[selectedItemIndex]].deselect();
              selectedItemIndex = selectedItemIndex + 1 < scope.classes.length ? selectedItemIndex + 1 : scope.classes.length - 1;
            }
            
            selectedItem = scope.classes[selectedItemIndex];
            scope.resultItems[selectedItem].select();
          });
        },

        enter: function() {
          scope.closeSearchResultMenu();
          scope.$apply(function() {
            if (scope.classMenuEnabled) {
              scope.loadPage(selectedItem);
              var selectedItemIndex = _.indexOf(scope.classes, selectedItem);
              scope.resultItems[scope.classes[selectedItemIndex]].deselect();
              selectedItem = null;
            }
          });
        }

      });

    }
  };
}]);
