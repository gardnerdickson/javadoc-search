
app.directive('searchResult', ['$log', '$timeout', 'searchDataLocator', 'javadocService', 'keyPressWatcher', 'constants', function($log, $timeout, searchDataLocator, javadocService, keyPressWatcher, constants) {
  return {
    templateUrl: 'static/partials/search-result.html',
    restrict: 'A',
    link: function(scope, element, attrs) {

      scope.SearchResult = {};

      scope.ancestors = [];
      scope.descendants = [];
      scope.showRelatives = false;
      scope.selected = false;
      scope.name = scope.result.name;
      scope.classInfo = searchDataLocator.getClassInfo()[scope.name];
      scope.loadingRelatives = false;

      var uniqueId = _.uniqueId();
      var relativesLoaded = false;


      scope.SearchResult.setRelativeScope = function(name, scope) {
        _.each(scope.classRelatives, function(relative) {
          if (relative.name === name) {
            relative.scope = scope;
          }
        });
      };

      scope.select = function() {
        scope.selected = true;
      };

      scope.deselect = function() {
        scope.selected = false;
      };


      keyPressWatcher.register({

        left: function() {
          var selectedClassName = scope.SearchResultMenu.getHighlightedSearchResult();
          if (scope.name === selectedClassName) {
            scope.$apply(function() {
              scope.showRelatives = false;
            });
          }
        },

        right: function() {
          if (scope.loadingRelatives) {
            return;
          }

          var selectedClassName = scope.SearchResultMenu.getHighlightedSearchResult();

          if (scope.name === selectedClassName) {

            scope.selectedSearchResult = scope.SearchResultMenu.getHighlightedSearchResult();

            $log.log("toggling class relative menu");
            var topContainer = $('.top-container');
            if (topContainer.hasClass('class-relative-menu-open')) {
              topContainer.removeClass('class-relative-menu-open')
            }
            else {
              topContainer.addClass('class-relative-menu-open');
            }

            //scope.$apply(function() {
            //  scope.showRelatives = true;
            //});
            //
            //if (!relativesLoaded) {
            //  var classInfo = searchDataLocator.getClassInfo()[scope.name];
            //
            //  scope.loadingRelatives = true;
            //
            //  var classUrl = new URI(scope.javadocUrl).segment(classInfo.url);
            //  javadocService.retrieveRelatives(classUrl.toString()).then(function(relatives) {
            //
            //    var ancestors = _.pluck(relatives.ancestors, 'className');
            //    var descendants = _.pluck(relatives.descendants, 'className');
            //    relativesLoaded = true;
            //
            //    _.each(ancestors ,function(ancestor) {
            //      scope.ancestors.push({name: ancestor})
            //    });
            //
            //    _.each(descendants, function(descendant) {
            //      scope.descendants.push({name: descendant});
            //    });
            //
            //    scope.loadingRelatives = false;
            //  });
            //}
          }
        }

      }, uniqueId);


      scope.SearchResultMenu.setSearchResultScope(scope.name, scope);
      if (scope.$first) {
        scope.select();
      }

      element.on('$destroy', function() {
        keyPressWatcher.unregister(uniqueId);
      });

    }
  }
}]);
