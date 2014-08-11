
app.directive('searchBox', ['$log', 'matcherLocator', function($log, matcherLocator) {
  return {
    templateUrl: 'static/partials/search-box.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      var basicMatcher = null;

      var searchResultMenu = {};

      scope.onChange = function() {
        $log.log('onchange');
        if (basicMatcher === null) {
          basicMatcher = matcherLocator.getMatcher('Basic');
        }
        var matches = basicMatcher.findMatches(scope.query);
        searchResultMenu.updateResults(matches);
      };

      scope.setSearchResultMenu = function(menu) {
        searchResultMenu = menu;
      };

    }
  }
}]);

app.directive('searchResultMenu', ['$log', '$timeout', function($log, $timeout) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.updateResults = function(searchResults) {
        $timeout(function() {
          scope.searchResults = searchResults;
        }, 0);
      };

      scope.setSearchResultMenu(scope);

    }
  };
}]);
