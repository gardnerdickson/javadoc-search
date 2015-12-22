
app.directive('searchResultMenu', ['$log', '$timeout', 'searchDataLocator', 'keyPressWatcher', 'constants', function($log, $timeout, searchDataLocator, keyPressWatcher, constants) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResultMenu = {};

      scope.searchResultScopes = {};

      scope.SearchResultMenu.setSearchResultScope = function(name, searchResultScope) {
        scope.searchResultScopes[name] = searchResultScope;
      };

      // TODO: Should probably cache the selected search result.
      scope.SearchResultMenu.getSelectedSearchResult = function() {
        var selectedSearchResult = null;
        _.each(scope.searchResults, function(searchResult) {

          if (scope.searchResultScopes[searchResult].selected) {
            selectedSearchResult = searchResult;
          }
        });
        return selectedSearchResult;
      };



      keyPressWatcher.register({

        up: function() {
          scope.$apply(function() {

            if (scope.searchResults.length === 0) {
              return;
            }

            var foundSelected = false;
            for (var i = 0; i < scope.searchResults.length; i++) {

              if (scope.searchResultScopes[scope.searchResults[i]].selected && i > 0) {
                foundSelected = true;
                if (i - 1 >= 0) {

                  scope.searchResultScopes[scope.searchResults[i]].selected = false;
                  scope.searchResultScopes[scope.searchResults[i - 1]].selected = true;

                  var searchResultName = scope.SearchResultMenu.getSelectedSearchResult();
                  if (scope.searchMode === 'Classes') {
                    scope.selectedSearchResult = {type: 'Class', value: searchResultName};
                  }
                  else {
                    scope.selectedSearchResult = {type: 'Package', value: searchResultName};
                  }
                }
                break;
              }
            }

            if (!foundSelected) {
              scope.searchResultScopes[scope.searchResults[0]].selected = true;
            }

          });
        },

        down: function() {
          scope.$apply(function() {

            if (scope.searchResults.length === 0) {
              return;
            }

            // find the selected class
            var foundSelected = false;
            for (var i = 0; i < scope.searchResults.length; i++) {

              if (scope.searchResultScopes[scope.searchResults[i]].selected) {
                foundSelected = true;
                if (i + 1 < scope.searchResults.length) {

                  scope.searchResultScopes[scope.searchResults[i]].selected = false;
                  scope.searchResultScopes[scope.searchResults[i + 1]].selected = true;

                  var searchResultName = scope.SearchResultMenu.getSelectedSearchResult();
                  if (scope.searchMode === 'Classes') {
                    scope.selectedSearchResult = {type: 'Class', value: searchResultName};
                  }
                  else {
                    scope.selectedSearchResult = {type: 'Package', value: searchResultName};
                  }
                }
                break;
              }
            }

            if (!foundSelected) {
              scope.searchResultScopes[scope.searchResults[0]].selected = true;
            }
          });
        }
      });

      scope.SearchBox_.setSearchResultMenu(scope.SearchResultMenu);
    }
  };
}]);
