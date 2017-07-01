
app.service('searchResultData', ['$log', function($log) {
  
  var service = {};
  
  var results = {};
  var filterMap = {};
  var filteredQualifiedClassNames = [];

  service.setResults = function(searchResults) {
    results = searchResults;
    _.each(results, function(result) {
      filterMap[result] = true;
    });
    filteredQualifiedClassNames = getFilteredQualifiedClassNames(filterMap);
  };

  service.updateFilter = function(searchResults) {
    for (var i in filterMap) {
      filterMap[i] = false
    }
    _.each(searchResults, function(searchResult) {
      filterMap[searchResult] = true;
    });
    filteredQualifiedClassNames = getFilteredQualifiedClassNames(filterMap);
  };

  service.checkSearchResult = function(searchResult) {
    return filterMap[searchResult];
  };

  service.getMatchedSearchResults = function() {
    return filteredQualifiedClassNames;
  };


  function getFilteredQualifiedClassNames(filterMap) {
    return _.filter(results, function(result) {
      return filterMap[result]
    });
  }

  return service;
}]);
