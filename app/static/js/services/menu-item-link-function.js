
app.service('menuItemLinkFunction', ['$log', 'searchDataLocator', function($log, searchDataLocator) {

  this.link = function(scope, element, attrs, menuController) {

    var onClickMethod;

    scope.selected = false;

    scope.searchResultType = attrs['searchResultType'];
    switch (attrs['searchResultType']) {
      case 'Class':
        scope.details = searchDataLocator.getClassesByClassName()[scope.item];
        onClickMethod = scope.loadJavadocClassPage;
        break;
      case 'Package':
        scope.details = searchDataLocator.getPackageInfo()[scope.item];
        onClickMethod = scope.loadJavadocPackagePage;
        break;
      case 'Method':
        scope.details = searchDataLocator.getMethodInfo()[scope.item];
        onClickMethod = scope.loadJavadocMethodAnchor;
        break;
    }

    scope.select = function () {
      scope.selected = true;
      scope.$emit('SELECTED_SEARCH_RESULT_CHANGED', scope.item);
    };

    scope.onHover = function() {
      menuController.selectItemFromHover(scope.item);
    };

    scope.onClick = function() {
      onClickMethod(scope.item);
    };

    scope.deselect = function () {
      scope.selected = false;
    };

    menuController.addResultItem(scope);
  }

}]);
