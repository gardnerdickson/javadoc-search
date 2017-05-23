
app.service('searchResultData', ['$log', function($log) {
  
  var service = {};
  
  var results = {};
  var filterMap = {};
  
  service.setResults = function(searchResults) {
    results = searchResults;
    _.each(results, function(result) {
      filterMap[result] = true;
    });
  };

  service.updateFilter = function(searchResults) {

    $log.debug("search-result-data: Updating filter map...");

    // reset the filterMap
    for (var i in filterMap) {
      filterMap[i] = false
    }

    _.each(searchResults, function(searchResult) {
      filterMap[searchResult] = true
    });

    $log.debug("search-result-data: Done updating filter map: ", filterMap);
  };

  service.checkSearchResult = function(searchResult) {
    return filterMap[searchResult];
  };

  service.getMatchedSearchResults = function() {
    return _.filter(results, function(result) {
      return filterMap[result]
    });
  };

  return service;
}]);
