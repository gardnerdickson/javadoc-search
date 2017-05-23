
app.directive('searchResultMenu', ['$rootScope' ,'$log', 'keyPressWatcher', 'javadocData', 'searchResultData', function($rootScope, $log, keyPressWatcher, javadocData, searchResultData) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    restrict: 'A',
    controller: function($scope, $element) {

      $scope.resultItems = {};

      this.addResultItem = function(resultItemScope) {
        $scope.resultItems[resultItemScope.item] = resultItemScope;
      };

      this.enabled = function() {
        return $scope.classMenuEnabled;
      };

    },
    link: function(scope, element, attrs, controller) {

      scope.classes = [];
      scope.classMenuEnabled = false;

      var selectedItem = null;


      scope.$on('CLASSES_LOADED', function(event, classes) {
        $log.log("search-result-menu: Received CLASSES_LOADED event.");
        scope.classes = classes.slice();
      });

      // scope.$on('SEARCH_RESULTS_UPDATED', function(event, searchResults) {
      //   scope.classes = searchResults.slice();
      // });

      scope.$on('DESELECT_SEARCH_RESULT', function(event, searchResult) {
        selectedItem = null;
      });

      scope.$on('ENABLE_SEARCH_RESULT_MENU', function(event, value) {
        scope.classMenuEnabled = value;
        if (scope.classMenuEnabled && selectedItem !== null) {
          scope.resultItems[selectedItem].select();
        }
      });


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
            var matchedItems = searchResultData.getMatchedSearchResults();
            if (selectedItem !== null) {
              // selectedItemIndex = _.indexOf(scope.classes, selectedItem);
              selectedItemIndex = _.indexOf(matchedItems, selectedItem);
              // scope.resultItems[scope.classes[selectedItemIndex]].deselect();
              scope.resultItems[matchedItems[selectedItemIndex]].deselect();
              selectedItemIndex = selectedItemIndex - 1 >= 0 ? selectedItemIndex - 1 : 0;
            }

            // selectedItem = scope.classes[selectedItemIndex];
            selectedItem = matchedItems[selectedItemIndex];
            scope.resultItems[selectedItem].select();
          });
        },

        down: function() {
          if (!scope.classMenuEnabled) {
            return;
          }

          scope.$apply(function() {
            var selectedItemIndex = 0;
            var matchedItems = searchResultData.getMatchedSearchResults();
            if (selectedItem !== null) {
              // selectedItemIndex = _.indexOf(scope.classes, selectedItem);
              selectedItemIndex = _.indexOf(matchedItems, selectedItem);
              // scope.resultItems[scope.classes[selectedItemIndex]].deselect();
              scope.resultItems[matchedItems[selectedItemIndex]].deselect();
              // selectedItemIndex = selectedItemIndex + 1 < scope.classes.length ? selectedItemIndex + 1 : scope.classes.length - 1;
              selectedItemIndex = selectedItemIndex + 1 < matchedItems.length ? selectedItemIndex + 1 : matchItems.length - 1;
            }
            
            // selectedItem = scope.classes[selectedItemIndex];
            selectedItem = matchedItems[selectedItemIndex];
            scope.resultItems[selectedItem].select();
          });
        },

        enter: function() {
          scope.$apply(function() {
            scope.closeSearchResultMenu();
            if (scope.classMenuEnabled) {
              selectedItem = null;
            }
          })
        }

      });

    }
  };
}]);
