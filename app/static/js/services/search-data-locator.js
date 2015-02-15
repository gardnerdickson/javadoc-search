
/**
 *  This creates a map out of the search data using the class name or package name as the key.
 *
 *  So this:
 *  {
 *    'package': com.example,
 *    'className': ExampleClass,
 *    'classType': Class,
 *    'url': com/example/ExampleClass.html
 *  }
 *
 *  becomes this:
 *  'ExampleClass': {
 *    'package': com.example,
 *    'className': ExampleClass,
 *    'classType': Class,
 *    'url': com/example/ExampleClass.html
 *  }
 */
app.service('searchDataLocator', ['constants', function(constants) {

  var service = {};

  var classInfo = {};
  var classNames = [];

  var packageInfo = {};
  var packageNames = {};

  service.getClassInfo = function() {
    return classInfo
  };

  service.getClassNames = function() {
    return classNames;
  };

  service.getPackageData = function() {
    return packageInfo;
  };

  service.getPackageNames = function() {
    return packageNames;
  };

  service.setClassData = function(classes) {
    var classMap = {};
    _.each(classes, function(classInfo) {
      var className = classInfo['className'];
      while (_.contains(_.keys(classMap), className)) {
        className += "#"
      }
      classMap[className] = classInfo;
    });

    classInfo = classMap;
    classNames = _.keys(classInfo);
  };

  service.setPackageData = function(packages) {
    var packageMap = {};
    _.each(packages, function(packageInfo) {
      packageMap[packageInfo['packageName']] = packageInfo;
    });

    packageInfo = packageMap;
    packageNames = _.pluck(packageInfo, 'packageName')
  };


  return service;
}]);
