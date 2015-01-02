
app.directive('searchBox', ['$log', 'matcherLocator', 'searchDataLocator', 'keyPressWatcher', function($log, matcherLocator, searchDataLocator, keyPressWatcher) {
  return {
    templateUrl: 'static/partials/search-box.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      var basicClassesMatcher = null;
      var basicPackagesMatcher = null;
      var searchResultMenu = {};
      var lastQuery = null;
      var focus = false;
      var matches = [];

      scope.SearchBox = {};

      scope.SearchBox.searchMode = 'Classes';

      scope.SearchBox.setSearchResultMenu = function(menu) {
        searchResultMenu = menu;
      };

      scope.onChange = function($event) {

        if (lastQuery === null || lastQuery === '') {
          openSearchResultMenu();
        }
        else if (scope.query === '') {
          closeSearchResultMenu();
        }

        if (basicClassesMatcher === null) {
          basicClassesMatcher = matcherLocator.getMatcher('Classes_Basic');
        }
        if (basicPackagesMatcher === null) {
          basicPackagesMatcher = matcherLocator.getMatcher('Packages_Basic');
        }

        try {
          if (scope.query.indexOf(':') === 0) {
            scope.SearchBox.searchMode = 'Packages';
            matches = basicPackagesMatcher.findMatches(scope.query.substr(1));
          }
          else {
            scope.SearchBox.searchMode = 'Classes';
            matches = basicClassesMatcher.findMatches(scope.query);
          }
        }
        catch (ignore) { }

        searchResultMenu.updateResults(matches);

        lastQuery = scope.query;
      };

      scope.onFocus = function() {
        focus = true;
      };

      scope.onBlur = function() {
        focus = false;
      };

      keyPressWatcher.addHandler(keyPressWatcher.events.ENTER, function() {
        closeSearchResultMenu();

        var selectedSearchResult = searchResultMenu.getSelectedSearchResult();
        if (selectedSearchResult !== null) {
          scope.query = selectedSearchResult.replace(/#/g, '');
          if (scope.SearchBox.searchMode === 'Packages') {
            scope.query = ':' + scope.query;
          }
        }

        lastQuery = '';
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.ESC, function() {
        scope.$apply(function() {
          closeSearchResultMenu();
          scope.query = '';
          lastQuery = '';
        });
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.PRINTABLE, function(charCode) {
        if (!focus) {
          element.find('input').focus();
          scope.query += String.fromCharCode(charCode);
          scope.onChange(null);
        }
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.BACKSPACE, function() {
        if (!focus) {
          element.find('input').focus();
          scope.query = scope.query.slice(0, scope.query.length - 2)
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

app.directive('searchResultMenu', ['$log', '$timeout', 'searchDataLocator', 'javadocService', 'keyPressWatcher', 'constants', function($log, $timeout, searchDataLocator, javadocService, keyPressWatcher, constants) {
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
          if (scope.SearchBox.searchMode === 'Classes') {
            scope.loadJavadocClassPage(scope.SearchResultMenu.getSelectedSearchResult())
          }
          else {
            scope.loadJavadocPackagePage(scope.SearchResultMenu.getSelectedSearchResult())
          }
        });
      });

      scope.SearchBox.setSearchResultMenu(scope.SearchResultMenu);

    }
  };
}]);


app.directive('searchResult', ['$log', 'searchDataLocator', 'javadocService', 'keyPressWatcher', 'constants', function($log, searchDataLocator, javadocService, keyPressWatcher, constants) {
  return {
    templateUrl: 'static/partials/search-result.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResult = {};

      scope.ancestors = [];
      scope.descendants = [];
      scope.showRelatives = false;
      scope.selected = false;
      scope.name = scope.result.name;
      scope.classInfo = searchDataLocator.getClassInfo()[scope.name];
      scope.loadingRelatives = false; // TODO: this isn't used for anything right now.

      var uniqueId = _.uniqueId();
      var relativesLoaded = false;


      scope.SearchResult.setRelativeScope = function(name, scope) {
        _.each(scope.classRelatives, function(relative) {
          if (relative.name === name) {
            relative.scope = scope;
          }
        });
      };

      scope.select = function() {
        scope.selected = true;
      };

      scope.deselect = function() {
        scope.selected = false;
      };


      keyPressWatcher.addHandler(keyPressWatcher.events.LEFT, function() {
        var selectedClassName = scope.SearchResultMenu.getSelectedSearchResult();
        if (scope.name === selectedClassName) {
          scope.$apply(function() {
            scope.showRelatives = false;
          });
        }
      }, uniqueId);

      keyPressWatcher.addHandler(keyPressWatcher.events.RIGHT, function() {

        var selectedClassName = scope.SearchResultMenu.getSelectedSearchResult();

        if (scope.name === selectedClassName) {
          scope.$apply(function() {
            scope.showRelatives = true;
          });

          if (!relativesLoaded) {
            var classInfo = searchDataLocator.getClassInfo()[scope.name];

            scope.loadingRelatives = true;
            javadocService.retrieveRelatives(new URI(classInfo.url).toString(), function(relatives) {

              var ancestors = _.pluck(relatives.ancestors, 'className');
              var descendants = _.pluck(relatives.descendants, 'className');
              relativesLoaded = true;

              _.each(ancestors ,function(ancestor) {
                scope.ancestors.push({name: ancestor})
              });

              _.each(descendants, function(descendant) {
                scope.descendants.push({name: descendant});
              });

              scope.loadingRelatives = false;
            });
          }
        }
      }, uniqueId);

      scope.SearchResultMenu.setSearchResultScope(scope.name, scope);

      element.on('$destroy', function() {
        keyPressWatcher.removeHandler(keyPressWatcher.events.UP, uniqueId);
        keyPressWatcher.removeHandler(keyPressWatcher.events.DOWN, uniqueId);
        keyPressWatcher.removeHandler(keyPressWatcher.events.LEFT, uniqueId);
        keyPressWatcher.removeHandler(keyPressWatcher.events.RIGHT, uniqueId);
      });

    }
  }
}]);


app.directive('classRelative', ['$log', 'searchDataLocator', function($log, searchDataLocator) {
  return {
    templateUrl: 'static/partials/class-relative.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.selected = false;
      scope.visible = true;
      scope.relativeInfo = searchDataLocator.getClassInfo()[scope.relative.name];

      scope.loadClassRelative = function(name) {
        scope.loadJavadocClassPage(name);
      };

      scope.select = function() {
        scope.selected = true;
      };

      scope.deselect = function() {
        scope.selected = false;
      };

      scope.SearchResult.setRelativeScope(scope.$parent.name, name, scope);

    }
  }
}]);


app.directive('allClassesPopover', ['$log', function($log) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.testFunction = function(param) {
        $log.log("the test function got called motherfuckers!!!", param);
      };

      scope.$on('initialized.classes', function(e, classes) {
        var content = '';
        _.each(classes, function(classInfo) {
          content += '<a ng-click="testFunction(\'' + classInfo['className'] + '\')">' + classInfo['className'] + '</a><br>';
        });
        element.popover({
          title: 'All Classes',
          placement: 'bottom',
          html: true,
          content: content,
          container: 'body'
        });

      });
    }
  }
}]);
