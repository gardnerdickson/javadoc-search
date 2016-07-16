'use strict';

app.filter('packageMask', ['$log', function($log) {
  return function(input) {
    try {
      var index = input.lastIndexOf('.');
      if (index !== -1) {
        return input.substr(input.lastIndexOf('.') + 1, input.length - 1);
      }
      return input;
    }
    catch (e) {
      $log.error("packageMask filter failed on: ", input);
    }
  }
}]);
