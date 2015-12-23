
app.directive('searchResultMenu', ['$log', '$timeout', 'searchDataLocator', 'keyPressWatcher', 'constants', function($log, $timeout, searchDataLocator, keyPressWatcher, constants) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResultMenu = {};

      scope.SearchBox_.setSearchResultMenu(scope.SearchResultMenu);
    }
  };
}]);
