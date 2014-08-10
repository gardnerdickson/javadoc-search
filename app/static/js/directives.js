
app.directive('searchResultMenu', ['$log', '$timeout', 'searchResultObserver', function($log, $timeout, searchResultObserver) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    scope: {},
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.notify = function(searchResults) {
        $timeout(function() {
          scope.searchResults = searchResults;
        }, 0)
      };

      searchResultObserver.register(scope);

    }
  };
}]);
