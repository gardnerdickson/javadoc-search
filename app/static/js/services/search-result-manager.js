
app.service('searchResultManager', ['$log', function($log) {

  var service = {};

  var selectedSearchResult = null;
  var selectedSearchResultWatchers = [];

  service.setSelectedSearchResult = function(className) {
    $log.debug("Setting selected search result to ", className);
    selectedSearchResult = className;
    _.each(selectedSearchResultWatchers, function(watcher) {
      watcher(selectedSearchResult);
    })
  };

  service.registerSelectedSearchResultWatcher = function(watcher) {
    if (!_.contains(selectedSearchResultWatchers, watcher)) {
      selectedSearchResultWatchers.push(watcher);
    }
  };

  return service;
}]);
