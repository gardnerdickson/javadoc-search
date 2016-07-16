
app.directive('classRelativeMenu', ['$rootScope', '$log', 'keyPressWatcher', function($rootScope, $log, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/class-relative-menu.html',
    restrict: 'A',
    controller: function($scope, $element) {
      $scope.resultItems = {};
      this.addResultItem = function(resultItemScope) {
        $scope.resultItems[resultItemScope.item] = resultItemScope;
      };
    },
    link: function(scope, element, attr) {

      $log.log("class relative menu enabled: ", attr['selection-enabled']);

      scope.relatives = [];
      scope.relativeMenuEnabled = false;

      var selectedItem = null;
      var items = [];

      scope.$on('CLASS_RELATIVES_UPDATED', function(event, classRelatives) {
        scope.relatives = classRelatives;
        scope.classNames = {
          ancestors: _.pluck(classRelatives.ancestors, 'className'),
          descendants: _.pluck(classRelatives.descendants, 'className')
        };

        var index = 0;
        _.each(scope.classNames.ancestors, function(ancestor) {
          items[index++] = ancestor;
        });
        _.each(scope.classNames.descendants, function(descendant) {
          items[index++] = descendant;
        });

        if (!_.isEmpty(items)) {
          selectedItem = items[0];
        }
      });

      scope.$on('ENABLE_CLASS_RELATIVE_MENU', function(event, value) {
        scope.relativeMenuEnabled = value;
      });

      keyPressWatcher.register({

        up: function() {
          if (!scope.relativeMenuEnabled) {
            return;
          }

          scope.$apply(function() {
            var selectedItemIndex = 0;
            if (selectedItem !== null) {
              selectedItemIndex = _.indexOf(items, selectedItem);
              scope.resultItems[items[selectedItemIndex]].deselect();
              selectedItemIndex = selectedItemIndex - 1 >= 0 ? selectedItemIndex - 1 : 0;
            }

            selectedItem = items[selectedItemIndex];
            scope.resultItems[items[selectedItemIndex]].select();
          });
        },

        down: function() {
          if (!scope.relativeMenuEnabled) {
            return;
          }

          scope.$apply(function() {
            var selectedItemIndex = 0;
            if (selectedItem !== null) {
              selectedItemIndex = _.indexOf(items, selectedItem);
              scope.resultItems[items[selectedItemIndex]].deselect();
              selectedItemIndex = selectedItemIndex + 1 < items.length ? selectedItemIndex + 1 : items.length - 1;
            }

            selectedItem = items[selectedItemIndex];
            scope.resultItems[items[selectedItemIndex]].select();
          });

        },

        enter: function() {
          scope.$apply(function() {
            scope.closeClassRelativeMenu();
            if (scope.relativeMenuEnabled) {
              scope.searchMode === 'Class' ? scope.loadJavadocClassPage(selectedItem) : scope.loadJavadocPackagePage(selectedItem);
              selectedItem = null;
            }
          })
        }

      });

    }
  }
}]);
