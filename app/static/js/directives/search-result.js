
app.directive('searchResult', ['$log', '$timeout', 'searchDataLocator', 'javadocService', 'keyPressWatcher', 'constants', function($log, $timeout, searchDataLocator, javadocService, keyPressWatcher, constants) {
  return {
    templateUrl: 'static/partials/search-result.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResult = {};

      scope.selected = false;
      scope.name = scope.result;
      scope.classInfo = searchDataLocator.getClassInfo()[scope.name];

      var uniqueId = _.uniqueId();

      //scope.SearchResult.setRelativeScope = function(name, scope) {
      //  _.each(scope.classRelatives, function(relative) {
      //    if (relative.name === name) {
      //      relative.scope = scope;
      //    }
      //  });
      //};

      scope.select = function() {
        scope.selected = true;
      };

      scope.deselect = function() {
        scope.selected = false;
      };


      scope.$on('JavadocSearchController.setSelectedSearchResult', function(event, resultName) {
        scope.selected = scope.name === resultName;
      });


      scope.$on('searchResultMenu.findSelectedSearchResult', function(event) {
        if (scope.selected) {
          scope.$emit('searchResult.foundSelectedSearchResult', scope.name);
        }
      });


      keyPressWatcher.register({

        left: function() {
          if (scope.name === scope.selectedSearchResult) {
            scope.$apply(function() {
              scope.showRelatives = false;
            });
          }
        },

        // TODO(gdickson): Showing relatives should be controlled in the MainController
        right: function() {
          if (scope.loadingRelatives) {
            return;
          }

          if (scope.name === scope.selectedSearchResult) {
            $log.log("toggling class relative menu");
            var topContainer = $('.top-container');
            if (topContainer.hasClass('class-relative-menu-open')) {
              topContainer.removeClass('class-relative-menu-open')
            }
            else {
              topContainer.addClass('class-relative-menu-open');
            }
          }
        }

      }, uniqueId);

      element.on('$destroy', function() {
        keyPressWatcher.unregister(uniqueId);
      });

    }
  }
}]);
