
app.directive('searchBox', ['$log', 'matcherLocator', function($log, matcherLocator) {
  return {
    templateUrl: 'static/partials/search-box.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      var basicMatcher = null;

      var searchResultMenu = {};

      var lastQuery = null;

      scope.SearchBox = {};

      scope.SearchBox.setSearchResultMenu = function(menu) {
        searchResultMenu = menu;
      };

      scope.onChange = function() {

        if (lastQuery === null || lastQuery === '') {
          openSearchResultMenu();
        }
        else if (scope.query === '') {
          closeSearchResultMenu();
        }

        if (basicMatcher === null) {
          basicMatcher = matcherLocator.getMatcher('Basic');
        }
        var matches = basicMatcher.findMatches(scope.query);
        searchResultMenu.updateResults(matches);

        lastQuery = scope.query;
      };

      function openSearchResultMenu() {
        $('.top-container').addClass('menu-open');
      }

      function closeSearchResultMenu() {
        $('.top-container').removeClass('menu-open');
      }

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

      scope.SearchBox.setSearchResultMenu(scope);

    }
  };
}]);
