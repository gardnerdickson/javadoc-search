
app.directive('searchBox', ['$log', 'matcherLocator', 'searchDataLocator', function($log, matcherLocator, searchDataLocator) {
  return {
    templateUrl: 'static/partials/search-box.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      var basicMatcher = null;
      var searchResultMenu = {};
      var lastQuery = null;
      var focus = false;
      var matches = [];

      scope.SearchBox = {};

      scope.SearchBox.setSearchResultMenu = function(menu) {
        searchResultMenu = menu;
      };

      scope.$on('JavadocSearchController.keypress', function(event, keyPress) {

        if (!focus) {

          element.find('input').focus();

          // If captured key is a printable character
          if (keyPress.which >= 32 && keyPress.which <= 126) {
            scope.query += String.fromCharCode(keyPress.which);
            scope.onChange(null);
          }

          // If captured key is backspace
          if (keyPress.which === 8) {
            scope.query = scope.query.slice(0, scope.query.length - 2)
          }
        }
      });

      scope.onChange = function($event) {

        if (lastQuery === null || lastQuery === '') {
          openSearchResultMenu();
        }
        else if (scope.query === '') {
          closeSearchResultMenu();
        }

        if (basicMatcher === null) {
          basicMatcher = matcherLocator.getMatcher('Basic');
        }

        try { matches = basicMatcher.findMatches(scope.query); }
        catch (exception) { /* suppress */ }

        searchResultMenu.updateResults(matches);

        lastQuery = scope.query;
      };

      scope.onFocus = function() {
        focus = true;
      };

      scope.onBlur = function() {
        focus = false;
      };

      scope.$on('JavadocSearchController.keypress', function(event, keyPress) {
        if (keyPress.which === 13) {
          closeSearchResultMenu();
          scope.query = matches[searchResultMenu.selectedIndex];
          lastQuery = '';
        }

        if (keyPress.which === 27) {
          closeSearchResultMenu();
          scope.query = '';
          lastQuery = '';
        }
      });

      function openSearchResultMenu() {
        $('.top-container').addClass('menu-open');
      }

      function closeSearchResultMenu() {
        $('.top-container').removeClass('menu-open');
      }

    }
  }
}]);

app.directive('searchResultMenu', ['$log', '$timeout', 'searchDataLocator', 'javadocService', function($log, $timeout, searchDataLocator, javadocService) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResultMenu = {};

      scope.SearchResultMenu.updateResults = function(searchResults) {
        scope.searchResults = searchResults;
      };

      scope.SearchResultMenu.selectedIndex = -1;

      scope.$on('JavadocSearchController.keypress', function(event, keyPress) {

        $timeout(function() {
          if (keyPress.which === 38) { // up
            scope.SearchResultMenu.selectedIndex--;
            if (scope.SearchResultMenu.selectedIndex < 0) {
              scope.SearchResultMenu.selectedIndex = 0;
            }
          }
          else if (keyPress.which === 40) { // down
            scope.SearchResultMenu.selectedIndex++;
            if (scope.SearchResultMenu.selectedIndex > scope.searchResults.length - 1) {
              scope.SearchResultMenu.selectedIndex = scope.searchResults.length - 1;
            }
          }
          else if (keyPress.which === 39) {

            var className = scope.searchResults[scope.SearchResultMenu.selectedIndex];
            var classInfo = searchDataLocator.getSearchData('Classes')[className];

            javadocService.retrieveRelatives(new URI(classInfo.url).toString(), function(relatives) {
              $log.log("Class hierarchy info for ", className, ": ", relatives);
            });
          }

          if (keyPress.which === 13) {
            scope.loadJavadocClassPage(scope.searchResults[scope.SearchResultMenu.selectedIndex]);
            scope.SearchResultMenu.selectedIndex = -1;
          }

        }, 0);

      });


      scope.SearchBox.setSearchResultMenu(scope.SearchResultMenu);

    }
  };
}]);


app.directive('searchResult', ['$log', function($log) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResult = {};

    }
  }
}]);
