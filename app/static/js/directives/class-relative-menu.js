
app.directive('classRelativeMenu', ['$log', 'searchResultManager', 'searchDataLocator', function($log, searchResultManager, searchDataLocator) {
  return {
    templateUrl: 'static/partials/class-relative-menu.html',
    restrict: 'A',
    link: function(scope, element, attr) {

      //searchResultManager.registerSelectedSearchResultWatcher(function(className) {
      //  $log.debug("class-relative-menu watcher got called!");
      //  scope.classInfo = searchDataLocator.getClassInfo()[className];
      //});

      $log.log("class relative menu enabled: ", attr['selection-enabled'])

    }
  }
}]);
