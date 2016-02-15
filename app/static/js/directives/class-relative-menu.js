
app.directive('classRelativeMenu', ['$rootScope', '$log', 'keyPressWatcher', function($rootScope, $log, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/class-relative-menu.html',
    restrict: 'A',
    link: function(scope, element, attr) {

      $log.log("class relative menu enabled: ", attr['selection-enabled']);

      scope.relatives = [];
      scope.relativeMenuEnabled = false;

      var selectedItem = null;

      scope.$on('CLASS_RELATIVES_UPDATED', function(event, classRelatives) {
        scope.relatives.ancestors = classRelatives.ancestors.slice();
        scope.relatives.descendants = classRelatives.descendants.slice();

        // TODO(gdickson): package should be selected first.
        if (!_.isEmpty(scope.relatives.ancestors)) {
          selectedItem = scope.relatives.ancestors[0];
        }
        else if (!_.isEmpty(scope.relatives.descendants)) {
          selectedItem = scope.relatives.descendants[0];
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
            var selectedCollection = null;

            if (selectedItem !== null) {
              if (_.contains(scope.relatives.ancestors, selectedItem)) {
                selectedItemIndex = _.indexOf(scope.relatives.ancestors, selectedItem);
                selectedCollection = scope.relatives.ancestors;
                selectedItemIndex--;
              }
              else if (_.contains(scope.relatives.descendants, selectedItem)) {
                selectedItemIndex = _.indexOf(scope.relatives.descendants, selectedItem);
                selectedCollection = scope.relatives.descendants;
                selectedItemIndex--;

                if (selectedItemIndex < 0 && !_.isEmpty(scope.relatives.ancestors)) {
                  if (!_.isEmpty(scope.relatives.ancestors)) {
                    selectedItemIndex = scope.relatives.ancestors.length - 1;
                    selectedCollection = scope.relatives.ancestors;
                  }
                  else {
                    selectedItemIndex = scope.relatives.descendants.length - 1;
                  }
                }
              }

            }

            $rootScope.$broadcast('SELECTED_SEARCH_RESULT_CHANGED', selectedCollection[selectedItemIndex]);
          });
        },


        down: function() {
          if (!scope.relativeMenuEnabled) {
            return;
          }

          scope.$apply(function() {
            var selectedItemIndex = 0;
            var selectedCollection = null;

            if (selectedItem !== null) {
              if (_.contains(scope.relatives.ancestors, selectedItem)) {
                selectedItemIndex = _.indexOf(scope.relatives.ancestors, selectedItem);
                selectedCollection = scope.relatives.ancestors;
                selectedItemIndex++;

                if (selectedItemIndex >= scope.relatives.ancestors.length) {
                  if (!_.isEmpty(scope.relatives.descendants)) {
                    selectedItemIndex = 0;
                    selectedCollection = scope.relatives.descendants;
                  }
                  else {
                    selectedItemIndex = scope.relatives.ancestors.length - 1;
                  }
                }
              }
              else if (_.contains(scope.relatives.descendants, selectedItem)) {
                selectedItemIndex = _.indexOf(scope.relatives.descendants, selectedItem);
                selectedCollection = scope.relatives.descendants;
                selectedItemIndex++;
              }

            }

            $rootScope.$broadcast('SELECTED_SEARCH_RESULT_CHANGED', selectedCollection[selectedItemIndex]);
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
