
app.directive('searchResultMenuItem', ['$rootScope', 'menuItemLinkFunction', function($rootScope, menuItemLinkFunction) {
  return {
    templateUrl: 'static/partials/search-result-menu-item.html',
    restrict: 'A',
    link: function(scope, element, attrs) {
      menuItemLinkFunction.link(scope, element, attrs, $rootScope);
    }
  }
}]);


app.directive('classRelativeMenuItem', ['$rootScope', 'menuItemLinkFunction', function($rootScope, menuItemLinkFunction) {
  return {
    templateUrl: 'static/partials/search-result-menu-item.html',
    restrict: 'A',
    link: function(scope, element, attrs) {
      menuItemLinkFunction.link(scope, element, attrs, $rootScope);
    }
  }
}]);
