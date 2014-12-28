'use strict';

app.filter('hashMask', [function() {
  return function(input) {
    return input.replace(/#/g, '');
  }
}]);
