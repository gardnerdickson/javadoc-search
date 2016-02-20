
app.directive('classRelativeMenu', ['$rootScope', '$log', 'keyPressWatcher', function($rootScope, $log, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/class-relative-menu.html',
    restrict: 'A',
    link: function(scope, element, attr) {

      $log.log("class relative menu enabled: ", attr['selection-enabled']);

      scope.relatives = [];
      scope.relativeMenuEnabled = false;

      var selectedItem = null;
      var items = [];

      scope.$on('CLASS_RELATIVES_UPDATED', function(event, classRelatives) {
        scope.relatives.ancestors = classRelatives.ancestors.slice();
        scope.relatives.descendants = classRelatives.descendants.slice();

        var index = 0;
        _.each(scope.relatives.ancestors, function(ancestor) {
          items[index++] = ancestor;
        });
        _.each(scope.relatives.descendants, function(descendant) {
          items[index++] = descendant;
        });

        if (!_.isEmpty(items)) {
          selectedItem = items[0];
        }
      });

      scope.$on('SELECTED_SEARCH_RESULT_CHANGED', function(event, searchResult) {
        if (scope.relativeMenuEnabled) {
          selectedItem = searchResult;
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
              selectedItemIndex = selectedItemIndex - 1 >= 0 ? selectedItemIndex - 1 : 0;
            }

            $rootScope.$broadcast('SELECTED_SEARCH_RESULT_CHANGED', items[selectedItemIndex]);
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
              selectedItemIndex = selectedItemIndex + 1 < items.length ? selectedItemIndex + 1 : items.length - 1;
            }

            $rootScope.$broadcast('SELECTED_SEARCH_RESULT_CHANGED', items[selectedItemIndex]);
          });

        },

        enter: function() {
          scope.$apply(function() {
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
