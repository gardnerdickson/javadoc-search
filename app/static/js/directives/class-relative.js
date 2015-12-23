
app.directive('classRelative', ['$log', 'searchDataLocator', function($log, searchDataLocator) {
  return {
    templateUrl: 'static/partials/class-relative.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.selected = false;
      scope.visible = true;
      scope.relativeInfo = searchDataLocator.getClassInfo()[scope.relative];

      scope.loadClassRelative = function(name) {
        scope.loadJavadocClassPage(name);
      };

      scope.select = function() {
        scope.selected = true;
      };

      scope.deselect = function() {
        scope.selected = false;
      };

      //scope.SearchResult.setRelativeScope(scope.$parent.name, name, scope);

    }
  }
}]);
