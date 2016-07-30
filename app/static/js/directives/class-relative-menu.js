
app.directive('classRelativeMenu', ['$rootScope', '$log', 'keyPressWatcher', function($rootScope, $log, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/class-relative-menu.html',
    restrict: 'A',
    controller: function($scope, $element) {
      $scope.relativeResultItems = {};
      this.addResultItem = function(resultItemScope) {
        $scope.relativeResultItems[resultItemScope.item] = resultItemScope;
        if (resultItemScope.item === $scope.classNames.ancestors[0]) {
          resultItemScope.select();
        }
      };
    },
    link: function(scope, element, attr) {

      $log.log("class relative menu enabled: ", attr['selection-enabled']);

      scope.relatives = {};
      scope.classNames = {};
      scope.relativeMenuEnabled = false;

      var selectedItem = null;
      var items = [];

      scope.$on('CLASS_RELATIVES_UPDATED', function(event, classRelatives) {
        scope.relatives.ancestors = _.values(classRelatives.ancestors);
        scope.relatives.descendants = _.values(classRelatives.descendants);
        scope.classNames.ancestors = _.keys(classRelatives.ancestors);
        scope.classNames.descendants = _.keys(classRelatives.descendants);

        items = _.union(_.keys(classRelatives.ancestors), _.keys(classRelatives.descendants));
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
              scope.relativeResultItems[items[selectedItemIndex]].deselect();
              selectedItemIndex = selectedItemIndex - 1 >= 0 ? selectedItemIndex - 1 : 0;
            }

            selectedItem = items[selectedItemIndex];
            scope.relativeResultItems[items[selectedItemIndex]].select();
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
              scope.relativeResultItems[items[selectedItemIndex]].deselect();
              selectedItemIndex = selectedItemIndex + 1 < items.length ? selectedItemIndex + 1 : items.length - 1;
            }

            selectedItem = items[selectedItemIndex];
            scope.relativeResultItems[items[selectedItemIndex]].select();
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
