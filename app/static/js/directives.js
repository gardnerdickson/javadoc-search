
app.directive('searchBox', ['$log', 'matcherLocator', 'searchDataLocator', 'keyPressWatcher', function($log, matcherLocator, searchDataLocator, keyPressWatcher) {
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

      keyPressWatcher.addHandler(keyPressWatcher.events.ENTER, function() {
        closeSearchResultMenu();
        scope.query = matches[searchResultMenu.selectedClassIndex];
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
      scope.selectionTree = {}; // Not really a tree just a linear list that represent the selectable results currently visible.

      scope.SearchResultMenu.selectionMode = constants.selectionMode.CLASSES;
      scope.SearchResultMenu.selectedClassIndex = -1;


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

//      scope.SearchResultMenu.addSearchResultChildScope = function(parentName, childName, childScope) {
//        scope.selectionTree[parentName].children[childName] = childScope;
//      };

//      scope.SearchResultMenu.removeSearchResultScope = function(name) {
//        delete scope.selectionTree[name];
//      };


//      scope.SearchResultMenu.insertResult = function(searchResults, parent) {
//        $log.log("Inserting results into the search tree: ", searchResults);
//        if (parent !== undefined) {
//          var parentIndex = scope.selectionTree.indexOf(parent);
//          if (parentIndex === -1) {
//            throw "Could not find class in selection tree: " + parent;
//          }
//
//          parentIndex++;
//          _.each(searchResults, function(result) {
//            scope.selectionTree.splice(parentIndex++, 0, {result: {}});
//          });
//        }
//        else {
//          _.each(searchResults, function(result) {
//            scope.selectionTree.push({result: {}});
//          });
//        }
//
//        $log.log("selectionTree: ", scope.selectionTree);
//      };

      scope.SearchResultMenu.selectedRelativeIndex = -1;

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


//          if (scope.SearchResultMenu.selectionMode == constants.selectionMode.CLASSES) {
//
//            if (_.contains(_.keys(scope.selectionTree), selectedClassName)) {
//              scope.selectionTree[selectedClassName].scope.deselect();
//            }
//
//            scope.SearchResultMenu.selectedClassIndex--;
//            if (scope.SearchResultMenu.selectedClassIndex < 0) {
//              scope.SearchResultMenu.selectedClassIndex = 0;
//            }
//
//            selectedClassName = scope.SearchResultMenu.searchResults[scope.SearchResultMenu.selectedClassIndex];
//            scope.selectionTree[selectedClassName].scope.select();
//          }
//          else if (scope.SearchResultMenu.selectionMode == constants.selectionMode.RELATIVES) {
//            var selectedSearchResult = searchResultScopes[scope.SearchResultMenu.selectedClassIndex];
//            selectedSearchResult.selectedRelativeIndex--;
//            if (selectedSearchResult.selectedRelativeIndex < 0) {
//              selectedSearchResult.selectedRelativeIndex = 0;
//            }
//          }
        });
      });

      keyPressWatcher.addHandler(keyPressWatcher.events.DOWN, function() {
        scope.$apply(function() {

          if (scope.SearchResultMenu.searchResults.length === 0) {
            return;
          }

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

//          if (scope.SearchResultMenu.selectionMode == constants.selectionMode.CLASSES) {
//
//            if (_.contains(_.keys(scope.selectionTree), selectedClassName)) {
//              scope.selectionTree[selectedClassName].scope.deselect();
//            }
//
//            scope.SearchResultMenu.selectedClassIndex++;
//            if (scope.SearchResultMenu.selectedClassIndex > scope.SearchResultMenu.searchResults.length - 1) {
//              scope.SearchResultMenu.selectedClassIndex = scope.SearchResultMenu.searchResults.length - 1;
//            }
//
//            selectedClassName = scope.SearchResultMenu.searchResults[scope.SearchResultMenu.selectedClassIndex];
//            scope.selectionTree[selectedClassName].scope.select();
//
//            $log.log("incrementing selectedClassIndex: ", scope.SearchResultMenu.selectedClassIndex);
//          }
//          else if (scope.SearchResultMenu.selectionMode == constants.selectionMode.RELATIVES) {
//            var selectedSearchResult = searchResultScopes[scope.SearchResultMenu.selectedClassIndex];
//            selectedSearchResult.selectedRelativeIndex++;
//            if (selectedSearchResult.selectedRelativeIndex > selectedSearchResult.classRelatives.length - 1) {
//              selectedSearchResult.selectedRelativeIndex = selectedSearchResult.classRelatives.length - 1;
//            }
//            $log.log("incrementing selectedClassIndex: ", scope.SearchResultMenu.selectedRelativeIndex);
//          }
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
          scope.loadJavadocClassPage(scope.SearchResultMenu.searchResults[scope.SearchResultMenu.selectedClassIndex]);
          scope.SearchResultMenu.selectedClassIndex = -1;
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

      scope.classRelatives = {};
      scope.showRelatives = false;
      scope.selected = false;
      scope.name = scope.result.name;

      var className = attrs.className;
      var uniqueId = _.uniqueId();
      var relativesLoaded = false;


      scope.setRelativeScope = function(name, scope) {
        _.each(scope.classRelatives, function(relative) {
          if (relative.name === name) {
            relative.scope = scope;
          }
        });
      };


      keyPressWatcher.addHandler(keyPressWatcher.events.LEFT, function() {
        var selectedClassName = scope.SearchResultMenu.searchResults[scope.SearchResultMenu.selectedClassIndex];
        if (className === selectedClassName) {
          scope.$apply(function() {
            scope.showRelatives = false;
          });
        }
      }, uniqueId);

      keyPressWatcher.addHandler(keyPressWatcher.events.RIGHT, function() {

        var selectedClassName = scope.SearchResultMenu.searchResults[scope.SearchResultMenu.selectedClassIndex];
        if (className === selectedClassName) {
          scope.$apply(function() {
            scope.showRelatives = true;
          });

          if (!relativesLoaded) {
            var classInfo = searchDataLocator.getSearchData('Classes')[className];

            javadocService.retrieveRelatives(new URI(classInfo.url).toString(), function(relatives) {

              var classRelatives = _.extend(_.keys(relatives.ancestors), _.keys(relatives.descendants));
              relativesLoaded = true;

              _.each(classRelatives, function(relative) {
                scope.classRelatives.push({name: relative});
              });

//              scope.SearchResultMenu.insertResult(scope.classRelatives.slice(), scope.name);

            });
          }
        }
      }, uniqueId);


//      scope.select = function() {
//        if (!element.hasClass('selected')) {
//          element.addClass('selected')
//        }
//      };
//
//      scope.deselect = function() {
//        element.removeClass('selected');
//      };


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


app.directive('classRelative', [function() {
  return {
    templateUrl: 'static/partials/class-relative.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.selected = false;
      scope.visible = true;

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
