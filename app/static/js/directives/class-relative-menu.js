
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

      this.enabled = function() {
        return $scope.relativeMenuEnabled;
      };

    },
    link: function(scope, element, attr, controller) {

      $log.log("class relative menu enabled: ", attr['selection-enabled']);

      scope.relatives = {};
      scope.classNames = {};
      scope.methodSignatures = [];
      scope.methods = [];
      scope.constructors = [];
      scope.constructorSignatures = [];
      scope.relativeMenuEnabled = false;

      var selectedItem = null;
      var items = [];

      scope.$on('CLASS_RELATIVES_LOADED', function(event, relatives, constructors, methods) {
        scope.relatives = relatives;
        scope.classNames.ancestors = _.pluck(relatives.ancestors, 'qualifiedClassName');
        scope.classNames.descendants = _.pluck(relatives.descendants, 'qualifiedClassName');

        scope.constructors = constructors;
        scope.constructorSignatures = _.pluck(constructors, 'signature');

        scope.methods = methods;
        scope.methodSignatures = _.pluck(methods, 'signature');

        items = _.union(scope.classNames.ancestors, scope.classNames.descendants, scope.constructorSignatures, scope.methodSignatures);

        if (!_.isEmpty(items)) {
          selectedItem = items[0];
        }
      });


      scope.$on('KEYPRESS_OPEN_RELATIVE_MENU', function() {
        scope.relativeMenuEnabled = true;
      });

      scope.$on('KEYPRESS_CLOSE_RELATIVE_MENU', function() {
        scope.relativeMenuEnabled = false;
      });

      scope.$on('SEARCH_RESULTS_UPDATED', function(event, value) {
        scope.relativeMenuEnabled = false;
      });
      
      scope.$on('SEARCH_RESULT_ARROW_CLICKED', function(event) {
        scope.relativeMenuEnabled = !scope.relativeMenuEnabled;
      });

      scope.$on('SEARCH_BOX_QUERY_CHANGED', function(event) {
        scope.relativeMenuEnabled = false;
      });


      controller.selectItemFromHover = function(item) {
        if (!scope.relativeMenuEnabled) {
          return;
        }
        var selectedItemIndex;
        if (selectedItem !== null) {
          selectedItemIndex = _.indexOf(items, selectedItem);
          $log.debug("Relative menu deselecting ", items[selectedItemIndex]);
          scope.relativeResultItems[items[selectedItemIndex]].deselect();
        }
        selectedItemIndex = _.indexOf(items, item);
        selectedItem = items[selectedItemIndex];
        scope.relativeResultItems[selectedItem].select();
      };


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
            scope.relativeMenuEnabled = false;
            scope.closeClassRelativeMenu();
            selectedItem = null;
          })
        },

        esc: function() {
          scope.$apply(function() {
            scope.relativeMenuEnabled = false;
            scope.closeClassRelativeMenu();
            if (selectedItem !== null) {
              scope.relativeResultItems[selectedItem].deselect();
              selectedItem = null;
            }
          });
        }

      }, 'relativeMenu');

    }
  }
}]);
