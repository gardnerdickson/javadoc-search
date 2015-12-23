
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


      element.on('$destroy', function() {
        keyPressWatcher.unregister(uniqueId);
      });

    }
  }
}]);
