
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

      scope.$on('SEARCH_BOX_QUERY_CHANGED', function(event, query) {
        if (scope.classMenuEnabled && selectedItem !== null) {
          scope.resultItems[selectedItem].deselect();
        }
        selectedItem = null;
      });

      scope.$on('SEARCH_RESULTS_UPDATED', function(event) {
        scope.classMenuEnabled = true;
        if (selectedItem !== null) {
          scope.resultItems[selectedItem].select();
        }
      });

      scope.$on('KEYPRESS_CLOSE_CLASS_MENU', function() {
        scope.classMenuEnabled = false;
      });

      scope.$on('KEYPRESS_OPEN_RELATIVE_MENU', function() {
        if (scope.classMenuEnabled) {
          scope.classMenuEnabled = false;
        }
      });
      
      scope.$on('KEYPRESS_CLOSE_RELATIVE_MENU', function() {
        if (!scope.classMenuEnabled) {
          scope.classMenuEnabled = true;
          if (selectedItem !== null) {
            scope.resultItems[selectedItem].select();
          }
        }
      });
      
      scope.$on('SEARCH_RESULT_ARROW_CLICKED', function(event) {
        if (!scope.classMenuEnabled) {
          scope.classMenuEnabled = true;
          if (selectedItem !== null) {
            scope.resultItems[selectedItem].select();
          }
        }
        else {
          scope.classMenuEnabled = false;
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
              selectedItemIndex = _.indexOf(matchedItems, selectedItem);
              scope.resultItems[matchedItems[selectedItemIndex]].deselect();
              selectedItemIndex = selectedItemIndex - 1 >= 0 ? selectedItemIndex - 1 : 0;
            }

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
              selectedItemIndex = _.indexOf(matchedItems, selectedItem);
              scope.resultItems[matchedItems[selectedItemIndex]].deselect();
              selectedItemIndex = selectedItemIndex + 1 < matchedItems.length ? selectedItemIndex + 1 : matchedItems.length - 1;
            }
            
            selectedItem = matchedItems[selectedItemIndex];
            scope.resultItems[selectedItem].select();
          });
        },

        enter: function() {
          scope.$apply(function() {
            scope.classMenuEnabled = false;
            scope.closeSearchResultMenu();
            selectedItem = null;
          })
        },

        esc: function() {
          scope.$apply(function() {
            scope.classMenuEnabled = false;
            scope.closeSearchResultMenu();
            if (selectedItem !== null) {
              scope.resultItems[selectedItem].deselect();
              selectedItem = null;
            }
          });
        }

      }, 'resultMenu');

    }
  };
}]);
