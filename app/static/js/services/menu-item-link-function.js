
app.service('menuItemLinkFunction', ['$log', 'searchDataLocator', 'keyPressWatcher', function($log, searchDataLocator, keyPressWatcher) {

  this.link = function(scope, element, attrs, menuController) {

    var loadPageFunction;

    scope.selected = false;

    scope.searchResultType = attrs['searchResultType'];
    switch (attrs['searchResultType']) {
      case 'Class':
        scope.details = searchDataLocator.getClassesByClassName()[scope.item];
        loadPageFunction = scope.loadJavadocClassPage;
        break;
      case 'Package':
        scope.details = searchDataLocator.getPackageInfo()[scope.item];
        loadPageFunction = scope.loadJavadocPackagePage;
        break;
      case 'Method':
        scope.details = searchDataLocator.getMethodInfo()[scope.item];
        loadPageFunction = scope.loadJavadocMethodAnchor;
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
      loadPageFunction(scope.item);
    };

    scope.deselect = function () {
      scope.selected = false;
    };


    keyPressWatcher.register({

      enter: function() {
        scope.$apply(function() {
          if (scope.selected && menuController.enabled()) {
            loadPageFunction(scope.item);
            scope.deselect();
          }
        });
      }

    });


    menuController.addResultItem(scope);
  }

}]);
