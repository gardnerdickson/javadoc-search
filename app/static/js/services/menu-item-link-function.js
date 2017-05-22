
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

    scope.select = function () {
      scope.selected = true;
      $log.debug("SELECTED SEARCH RESULT CHANGED TO ", scope.item);
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
    
    scope.$on('SEARCH_RESULTS_UPDATED', function() {
      scope.visible = searchResultData.checkSearchResult(scope.item)
    });


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
