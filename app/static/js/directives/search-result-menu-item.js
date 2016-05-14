
app.directive('searchResultMenuItem', ['$rootScope', '$log', '$timeout', 'searchDataLocator', 'javadocService', 'keyPressWatcher', 'constants', function($rootScope, $log, $timeout, searchDataLocator, javadocService, keyPressWatcher, constants) {
  return {
    templateUrl: 'static/partials/search-result-menu-item.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.selected = false;

      var loadFunction = null;
      if (attrs['searchResultType'] === 'Class') {
        scope.details = searchDataLocator.getClassInfo()[scope.item];
        loadFunction = scope.loadJavadocClassPage;
      }
      else {
        scope.details = searchDataLocator.getPackageInfo()[scope.item];
        loadFunction = scope.loadJavadocPackagePage;
      }

      scope.select = function() {
        scope.selected = true;
      };

      scope.deselect = function() {
        scope.selected = false;
      };

      scope.selectAndLoadPage = function(resultName) {
        loadFunction(resultName);
        $rootScope.$broadcast('SELECTED_SEARCH_RESULT_CHANGED', resultName)
      };

      scope.$on('SELECTED_SEARCH_RESULT_CHANGED', function(event, searchResult) {
        scope.selected = scope.item === searchResult;
      });

      scope.$on('DESELECT_SEARCH_RESULT', function(event, searchResult) {
        if (scope.item === searchResult) {
          scope.deselect();
        }
      });

    }
  }
}]);
