
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
app.service('javadocData', ['$log', 'constants', function($log, constants) {

  var service = {};

  var classesByQualifiedClassName = {};
  var classesByPackage = {};
  var classNames = [];
  var qualifiedClassNames = [];

  var packageInfo = {};
  var packageNames = {};

  var methodInfo = [];
  var constructorInfo = [];

  service.getClassesByQualifiedClassName = function() {
    return classesByQualifiedClassName;
  };

  service.getClassesByPackage = function() {
    return classesByPackage;
  };

  service.getClassNames = function() {
    return classNames;
  };

  service.getQualifiedClassNames = function() {
    return qualifiedClassNames;
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

  service.getConstructorInfo = function() {
    return constructorInfo;
  };

  service.setClassData = function(classes) {

    classesByQualifiedClassName = _.indexBy(classes, 'qualifiedClassName');
    classNames = _.pluck(classes, 'className');
    qualifiedClassNames = _.pluck(classes, 'qualifiedClassName');

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

  service.setConstructorData = function(constructors) {
    constructorInfo = _.indexBy(constructors, 'signature')
  };


  return service;
}]);
