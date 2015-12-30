
app.directive('searchResultMenuItem', ['$rootScope', '$log', '$timeout', 'searchDataLocator', 'javadocService', 'keyPressWatcher', 'constants', function($rootScope, $log, $timeout, searchDataLocator, javadocService, keyPressWatcher, constants) {
  return {
    templateUrl: 'static/partials/search-result-menu-item.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.selected = false;
      scope.classInfo = searchDataLocator.getClassInfo()[scope.item];

      scope.select = function() {
        scope.selected = true;
      };

      scope.deselect = function() {
        scope.selected = false;
      };

      scope.selectAndLoadPage = function(resultName) {
        scope.searchMode === 'Classes' ? scope.loadJavadocClassPage(resultName) : scope.loadJavadocPackagePage(resultName)
        $rootScope.$broadcast('SELECTED_SEARCH_RESULT_CHANGED', resultName)
      };

      scope.$on('SELECTED_SEARCH_RESULT_CHANGED', function(event, searchResult) {
        scope.selected = scope.item === searchResult;
      });


      scope.$on('searchResultMenu.findSelectedSearchResult', function(event) {
        if (scope.selected) {
          scope.$emit('searchResult.foundSelectedSearchResult', scope.item);
        }
      });

    }
  }
}]);
