app.service('menuItemLinkFunction', ['$log', 'javadocData', 'searchResultData', 'keyPressWatcher', function($log, javadocData, searchResultData, keyPressWatcher) {

  this.link = function(scope, element, attrs, menuController) {

    var loadPageFunction;

    scope.selected = false;

    scope.searchResultType = attrs['searchResultType'];
    switch (attrs['searchResultType']) {
      case 'Class':
        scope.details = javadocData.getClassesByQualifiedClassName()[scope.item];
        loadPageFunction = scope.loadJavadocClassPage;
        break;
      case 'Package':
        scope.details = javadocData.getPackageInfo()[scope.item];
        loadPageFunction = scope.loadJavadocPackagePage;
        break;
      case 'Method':
        scope.details = javadocData.getMethodInfo()[scope.item];
        loadPageFunction = scope.loadJavadocMethodAnchor;
        break;
      case 'Constructor':
        scope.details = javadocData.getConstructorInfo()[scope.item];
        loadPageFunction = scope.loadJavadocConstructorAnchor;
        break;
    }

    var keypressHandlerId;

    scope.select = function() {
      scope.selected = true;
      $log.debug("[menu-item-link-function] Selecting", scope.item);
      scope.$emit('SELECTED_SEARCH_RESULT_CHANGED', scope.item);
      keypressHandlerId = keyPressWatcher.register({
        enter: function() {
          scope.$apply(function() {
            if (scope.selected) {
              loadPageFunction(scope.item);
              scope.deselect();
            }
          });
        }
      }, 'resultItem')
    };

    // scope.onHover = function() {
    //   menuController.selectItemFromHover(scope.item);
    // };

    scope.onClick = function() {
      loadPageFunction(scope.item);
    };

    scope.deselect = function() {
      $log.debug("[menu-item-link-function] Deselecting", scope.item);
      scope.selected = false;
      keyPressWatcher.unregister(keypressHandlerId)
    };
    
    
    scope.searchResultArrowClicked = function() {
      scope.$emit('SEARCH_RESULT_ARROW_CLICKED', scope.item);
    };

    menuController.addResultItem(scope);
  }

}]);
