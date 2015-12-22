
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


      keyPressWatcher.register({

        left: function() {
          var selectedClassName = scope.SearchResultMenu.getSelectedSearchResult();
          if (scope.name === selectedClassName) {
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

          var selectedClassName = scope.SearchResultMenu.getSelectedSearchResult();

          if (scope.name === selectedClassName) {

            scope.selectedSearchResult = scope.SearchResultMenu.getSelectedSearchResult();

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


      scope.SearchResultMenu.setSearchResultScope(scope.name, scope);
      if (scope.$first) {
        scope.select();
      }

      element.on('$destroy', function() {
        keyPressWatcher.unregister(uniqueId);
      });

    }
  }
}]);
