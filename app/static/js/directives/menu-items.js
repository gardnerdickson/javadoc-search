
app.directive('searchResultMenuItem', ['menuItemLinkFunction', 'searchResultData', function(menuItemLinkFunction, searchResultData) {
  return {
    templateUrl: 'static/partials/search-result-menu-item.html',
    restrict: 'A',
    require: '^searchResultMenu',
    link: function(scope, element, attrs, menuController) {
      scope.menu = 'SearchResult';
      
      scope.$on('SEARCH_RESULTS_UPDATED', function() {
        scope.visible = searchResultData.checkSearchResult(scope.item)
      });

      menuItemLinkFunction.link(scope, element, attrs, menuController);
    }
  }
}]);


app.directive('classRelativeMenuItem', ['menuItemLinkFunction', function(menuItemLinkFunction) {
  return {
    templateUrl: 'static/partials/search-result-menu-item.html',
    restrict: 'A',
    require: '^classRelativeMenu',
    link: function(scope, element, attrs, menuController) {
      scope.menu = 'Relative';
      scope.visible = true;
      menuItemLinkFunction.link(scope, element, attrs, menuController);
    }
  }
}]);
