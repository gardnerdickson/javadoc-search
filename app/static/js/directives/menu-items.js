
app.directive('searchResultMenuItem', ['$rootScope', 'menuItemLinkFunction', function($rootScope, menuItemLinkFunction) {
  return {
    templateUrl: 'static/partials/search-result-menu-item.html',
    restrict: 'A',
    require: '^searchResultMenu',
    link: function(scope, element, attrs, menuController) {
      menuItemLinkFunction.link(scope, element, attrs, menuController, $rootScope);
    }
  }
}]);


app.directive('classRelativeMenuItem', ['$rootScope', 'menuItemLinkFunction', function($rootScope, menuItemLinkFunction) {
  return {
    templateUrl: 'static/partials/search-result-menu-item.html',
    restrict: 'A',
    require: '^classRelativeMenu',
    link: function(scope, element, attrs, menuController) {
      menuItemLinkFunction.link(scope, element, attrs, menuController, $rootScope);
    }
  }
}]);
