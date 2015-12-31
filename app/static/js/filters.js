'use strict';

app.filter('hashMask', ['$log', function($log) {
  return function(input) {
    try {
      return input.replace(/#/g, '');
    }
    catch (e) {
      $log.error("hashMask filter failed on: " + input);
    }
  }
}]);
