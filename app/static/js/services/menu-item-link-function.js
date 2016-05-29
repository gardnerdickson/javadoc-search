
app.service('menuItemLinkFunction', ['$log', 'searchDataLocator', function($log, searchDataLocator) {

  this.link = function(scope, element, attrs, menuController, $rootScope) {
    scope.selected = false;

    var loadFunction = null;
    if (attrs['searchResultType'] === 'Class') {
      scope.details = searchDataLocator.getClassInfo()[scope.item];
      loadFunction = scope.loadJavadocClassPage;
    }
    else {
      scope.details = searchDataLocator.getPackageInfo()[scope.item];
      loadFunction = scope.loadJavadocPackagePage;
    }

    scope.select = function () {
      scope.selected = true;
      scope.$emit('SELECTED_SEARCH_RESULT_CHANGED', scope.item);
    };

    scope.deselect = function () {
      scope.selected = false;
    };
    
    menuController.addResultItem(scope);
  }

}]);
