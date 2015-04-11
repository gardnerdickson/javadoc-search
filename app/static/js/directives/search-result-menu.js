
app.directive('searchResultMenu', ['$log', '$timeout', 'searchDataLocator', 'keyPressWatcher', 'constants', 'searchResultManager', function($log, $timeout, searchDataLocator, keyPressWatcher, constants, searchResultManager) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResultMenu = {};

      scope.SearchResultMenu.selectionMode = constants.selectionMode.CLASSES;


      scope.SearchResultMenu.updateResults = function(searchResults) {
        scope.SearchResultMenu.searchResults = [];
        _.each(searchResults, function(result) {
          scope.SearchResultMenu.searchResults.push({name: result});
        });
      };

      scope.SearchResultMenu.setSearchResultScope = function(name, searchResultScope) {
        _.each(scope.SearchResultMenu.searchResults, function(searchResult) {
          if (searchResult.name === name) {
            searchResult.scope = searchResultScope;
          }
        });
      };

      // TODO: Should probably cache the selected search result.
      scope.SearchResultMenu.getHighlightedSearchResult = function() {
        var selectedSearchResult = null;
        _.each(scope.SearchResultMenu.searchResults, function(searchResult) {
          if (searchResult.scope.selected) {
            selectedSearchResult = searchResult.name;
          }
        });
        return selectedSearchResult;
      };


      searchResultManager.registerHighlightedSearchResultWatcher(function(currentIndex, lastIndex) {
        scope.$apply(function() {

          scope.SearchResultMenu.searchResults[lastIndex].scope.selected = false;
          scope.SearchResultMenu.searchResults[currentIndex].scope.selected = true;

          if (searchResultManager.getSearchMode() === 'Classes') {
            scope.selectedSearchResult = {
              type: 'Class',
              value: searchResultManager.getHighlightedSearchResult()
            };
          }
          else {
            scope.selectedSearchResult = {
              type: 'Packages',
              value: searchResultManager.getHighlightedSearchResult()
            };
          }

        });
      });


      keyPressWatcher.register({

        left: function() {
          scope.SearchResultMenu.selectionMode = constants.selectionMode.CLASSES;
          $log.log("switching selectionMode to ", scope.SearchResultMenu.selectionMode);
        },

        right: function() {
          scope.SearchResultMenu.selectionMode = constants.selectionMode.RELATIVES;
          $log.log("switching selectionMode to ", scope.SearchResultMenu.selectionMode);
        }
      });


      scope.SearchBox_.setSearchResultMenu(scope.SearchResultMenu);

    }
  };
}]);
