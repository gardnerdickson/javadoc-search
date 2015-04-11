
// TODO: This is kind of an ugly "global variable" way of sharing the selectedSearchResult.
app.service('searchResultManager', ['$log', 'keyPressWatcher', 'searchDataLocator', 'matcherLocator', function($log, keyPressWatcher, searchDataLocator, matcherLocator) {

  var service = {};

  var searchResults = null;

  var highlightedSearchResultIndex = -1;
  var highlightedSearchResultWatchers = [];
  var searchResultSelectWatchers = [];

  var searchResultMenu = null;
  var classRelativeMenu = null;

  var lastQuery = null;

  var basicClassesMatcher = null;
  var basicPackagesMatcher = null;

  var searchMode = null;


  service.setSearchResultMenu = function(menu) {
    searchResultMenu = menu;
  };

  service.setClassRelativeMenu = function(menu) {
    classRelativeMenu = menu;
  };


  keyPressWatcher.register({

    enter: function() {
      _.each(searchResultSelectWatchers, function(watcher) {
        watcher(service.getHighlightedSearchResult());
      });
    },

    up: function() {
      var lastIndex = highlightedSearchResultIndex;
      highlightedSearchResultIndex--;
      if (highlightedSearchResultIndex < 0) {
        highlightedSearchResultIndex = 0;
      }

      _.each(highlightedSearchResultWatchers, function(watcher) {
        watcher(highlightedSearchResultIndex, lastIndex);
      });
    },

    down: function() {
      var lastIndex = highlightedSearchResultIndex;
      highlightedSearchResultIndex++;
      if (highlightedSearchResultIndex > searchResults.length - 1) {
        highlightedSearchResultIndex = searchResults.length - 1;
      }

      _.each(highlightedSearchResultWatchers, function(watcher) {
        watcher(highlightedSearchResultIndex, lastIndex);
      });
    }

  });


  service.search = function(query) {

    if (basicClassesMatcher === null) {
      basicClassesMatcher = matcherLocator.getMatcher('Classes_Basic');
    }
    if (basicPackagesMatcher === null) {
      basicPackagesMatcher = matcherLocator.getMatcher('Packages_Basic');
    }

    var querySanitized = query.replace(':', '');

    try {
      if (query.indexOf(':') === 0 && query !== ':') {
        searchMode = 'Packages';
        searchResults = basicPackagesMatcher.findMatches(querySanitized);
      }
      else {
        searchMode = 'Classes';
        searchResults = basicClassesMatcher.findMatches(querySanitized);
      }
    }
    catch (ignore) { }

    lastQuery = querySanitized;

    highlightedSearchResultIndex = 0;

    return searchResults;
  };


  service.getLastQuery = function() {
    return lastQuery;
  };

  service.getSearchMode = function() {
    return searchMode;
  };

  service.getHighlightedSearchResult = function() {
    if (searchMode === 'Classes') {
      return searchDataLocator.getClassInfo()[searchResults[highlightedSearchResultIndex]];
    }
    else {
      return searchDataLocator.getPackageInfo()[searchResults[highlightedSearchResultIndex]];
    }
  };


  service.registerHighlightedSearchResultWatcher = function(watcher) {
    if (!_.contains(highlightedSearchResultWatchers, watcher)) {
      highlightedSearchResultWatchers.push(watcher);
    }
  };

  service.unregisterHighlightedSearchResultWatcher = function(watcher) {
    var index = _.indexOf(highlightedSearchResultWatchers, watcher);
    if (index !== -1) {
      highlightedSearchResultWatchers.splice(_.indexOf(watcher), 1);
    }
  };


  service.registerSearchResultSelectWatcher = function(watcher) {
    if (!_.contains(searchResultSelectWatchers, watcher)) {
      searchResultSelectWatchers.push(watcher);
    }
  };

  service.unregisterSearchResultSelectWatcher= function(watcher) {
    var index = _.indexOf(searchResultSelectWatchers, watcher);
    if (index !== -1) {
      searchResultSelectWatchers.splice(_.indexOf(watcher), 1);
    }
  };


  return service;
}]);
