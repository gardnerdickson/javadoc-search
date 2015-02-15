
app.directive('searchResultMenu', ['$log', '$timeout', 'searchDataLocator', 'keyPressWatcher', 'constants', function($log, $timeout, searchDataLocator, keyPressWatcher, constants) {
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
      scope.SearchResultMenu.getSelectedSearchResult = function() {
        var selectedSearchResult = null;
        _.each(scope.SearchResultMenu.searchResults, function(searchResult) {
          if (searchResult.scope.selected) {
            selectedSearchResult = searchResult.name;
          }
        });
        return selectedSearchResult;
      };


      keyPressWatcher.addHandler(keyPressWatcher.events.UP, function() {
        scope.$apply(function() {

          if (scope.SearchResultMenu.searchResults.length === 0) {
            return;
          }

          var foundSelected = false;
          for (var i = 0; i < scope.SearchResultMenu.searchResults.length; i++) {
            if (scope.SearchResultMenu.searchResults[i].scope.selected && i > 0) {
              foundSelected = true;
              if (i - 1 >= 0) {
                scope.SearchResultMenu.searchResults[i].scope.selected = false;
                scope.SearchResultMenu.searchResults[i - 1].scope.selected = true;
              }
              break;
            }
          }

          if (!foundSelected) {
            scope.SearchResultMenu.searchResults[0].scope.selected = true;
          }

        });
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.DOWN, function() {
        scope.$apply(function() {

          if (scope.SearchResultMenu.searchResults.length === 0) {
            return;
          }

          //if (scope.SearchResultMenu.selectionMode === constants.selectionMode.RELATIVES) {
          //  $log.log("breakpoint");
          //}

          // find the selected class
          var foundSelected = false;
          for (var i = 0; i < scope.SearchResultMenu.searchResults.length; i++) {
            if (scope.SearchResultMenu.searchResults[i].scope.selected) {
              foundSelected = true;
              if (i + 1 < scope.SearchResultMenu.searchResults.length) {
                scope.SearchResultMenu.searchResults[i].scope.selected = false;
                scope.SearchResultMenu.searchResults[i + 1].scope.selected = true;
              }
              break;
            }
          }

          if (!foundSelected) {
            scope.SearchResultMenu.searchResults[0].scope.selected = true;
          }

        });
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.RIGHT, function() {
        scope.SearchResultMenu.selectionMode = constants.selectionMode.RELATIVES;
        $log.log("switching selectionMode to ", scope.SearchResultMenu.selectionMode);
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.LEFT, function() {
        scope.SearchResultMenu.selectionMode = constants.selectionMode.CLASSES;
        $log.log("switching selectionMode to ", scope.SearchResultMenu.selectionMode);
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.ENTER, function() {
        scope.$apply(function() {
          if (scope.SearchBox_.searchMode === 'Classes') {
            scope.loadJavadocClassPage(scope.SearchResultMenu.getSelectedSearchResult())
          }
          else {
            scope.loadJavadocPackagePage(scope.SearchResultMenu.getSelectedSearchResult())
          }
        });
      });

      scope.SearchBox_.setSearchResultMenu(scope.SearchResultMenu);

    }
  };
}]);
