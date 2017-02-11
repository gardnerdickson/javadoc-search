
app.directive('searchResultMenuItem', ['menuItemLinkFunction', function(menuItemLinkFunction) {
  return {
    templateUrl: 'static/partials/search-result-menu-item.html',
    restrict: 'A',
    require: '^searchResultMenu',
    link: function(scope, element, attrs, menuController) {
      scope.menu = 'SearchResult';
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
      menuItemLinkFunction.link(scope, element, attrs, menuController);
    }
  }
}]);
