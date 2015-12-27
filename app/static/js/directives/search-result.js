
app.directive('searchResult', ['$log', '$timeout', 'searchDataLocator', 'javadocService', 'keyPressWatcher', 'constants', function($log, $timeout, searchDataLocator, javadocService, keyPressWatcher, constants) {
  return {
    templateUrl: 'static/partials/search-result.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResult = {};

      scope.selected = false;
      scope.name = scope.result;
      scope.classInfo = searchDataLocator.getClassInfo()[scope.name];

      scope.select = function() {
        scope.selected = true;
      };

      scope.deselect = function() {
        scope.selected = false;
      };

      scope.selectAndLoadPage = function(resultName) {
        scope.setSelectedSearchResult(resultName);
        scope.searchMode === 'Classes' ? scope.loadJavadocClassPage(resultName) : scope.loadJavadocPackagePage(resultName)
      };


      scope.$on('JavadocSearchController.setSelectedSearchResult', function(event, resultName) {
        scope.selected = scope.name === resultName;
      });


      scope.$on('searchResultMenu.findSelectedSearchResult', function(event) {
        if (scope.selected) {
          scope.$emit('searchResult.foundSelectedSearchResult', scope.name);
        }
      });

    }
  }
}]);
