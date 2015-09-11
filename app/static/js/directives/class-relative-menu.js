
app.directive('classRelativeMenu', ['$log', 'searchDataLocator', function($log, searchDataLocator) {
  return {
    templateUrl: 'static/partials/class-relative-menu.html',
    restrict: 'A',
    link: function(scope, element, attr) {

      $log.log("class relative menu enabled: ", attr['selection-enabled'])

    }
  }
}]);
