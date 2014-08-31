
app.directive('searchBox', ['$log', 'matcherLocator', function($log, matcherLocator) {
  return {
    templateUrl: 'static/partials/search-box.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      var basicMatcher = null;
      var searchResultMenu = {};
      var lastQuery = null;
      var focus = false;

      scope.SearchBox = {};

      scope.SearchBox.setSearchResultMenu = function(menu) {
        searchResultMenu = menu;
      };

      scope.$on('JavadocSearchController.keypress', function(event, keyPress) {

        if (!focus) {

          element.find('input').focus();

          // If captured key is a printable character
          if (keyPress.which >= 32 && keyPress.which <= 126) {
            scope.query += String.fromCharCode(keyPress.keyCode);
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

        try { var matches = basicMatcher.findMatches(scope.query); }
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
          scope.query = '';
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

app.directive('searchResultMenu', ['$log', '$timeout', 'searchDataLocator', function($log, $timeout, searchDataLocator) {
  return {
    templateUrl: 'static/partials/search-result-menu.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.selectedIndex = -1;

      scope.updateResults = function(searchResults) {
        $timeout(function() {
          scope.searchResults = searchResults;
        }, 0);
      };

      scope.$on('JavadocSearchController.keypress', function(event, keyPress) {

        $timeout(function() {
          if (keyPress.which === 38) { // up
            scope.selectedIndex--;
            if (scope.selectedIndex < 0) {
              scope.selectedIndex = 0;
            }
          }
          else if (keyPress.which === 40) { // down
            scope.selectedIndex++;
            if (scope.selectedIndex > scope.searchResults.length - 1) {
              scope.selectedIndex = scope.searchResults.length - 1;
            }
          }
        }, 0);

        if (keyPress.which === 13) {
          scope.loadJavadocClassPage(scope.searchResults[scope.selectedIndex]);
          scope.selectedIndex = -1;
        }

      });


      scope.$watch('selectedIndex', function() {
        $log.log('selectedIndex: ', scope.selectedIndex);
      });

      scope.SearchBox.setSearchResultMenu(scope);

    }
  };
}]);
