
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

  var classesByClassName = {};
  var classesByPackage = {};
  var classNames = [];

  var packageInfo = {};
  var packageNames = {};

  var methodInfo = [];

  service.getClassesByClassName = function() {
    return classesByClassName;
  };

  service.getClassesByPackage = function() {
    return classesByPackage;
  };

  service.getClassNames = function() {
    return classNames;
  };

  service.getPackageInfo = function() {
    return packageInfo;
  };

  service.getPackageNames = function() {
    return packageNames;
  };

  service.getMethodInfo = function() {
    return methodInfo;
  };

  service.setClassData = function(classes) {
    classesByClassName = _.indexBy(classes, function(clazz) {
      return clazz['package'] + '.' + clazz['className'];
    });

    classNames = _.keys(classesByClassName);

    classesByPackage = {};
    _.each(classes, function(clazz) {
      if (!_.contains(_.keys(classesByPackage), clazz['package'])) {
        classesByPackage[clazz['package']] = {};
      }
      classesByPackage[clazz['package']][clazz['className']] = clazz;
    });
  };

  service.setPackageData = function(packages) {
    var packageMap = {};
    _.each(packages, function(packageInfo) {
      packageMap[packageInfo['packageName']] = packageInfo;
    });

    packageInfo = packageMap;
    packageNames = _.pluck(packageInfo, 'packageName')
  };

  service.setMethodData = function(methods) {
    methodInfo = _.indexBy(methods, 'signature');
  };


  return service;
}]);
