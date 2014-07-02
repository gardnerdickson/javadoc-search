'use strict';

app.service('javadocService', ['$http', function($http) {

  var service = {};

  service.retrieveClasses = function(javadocUrl, onComplete) {
    var config = {
      params: { url: encodeURIComponent(javadocUrl) }
    };
    $http.get('./classes', config).then(function(response) {
      onComplete(response.data);
    });
  };

  service.retrievePackages = function(javadocUrl, onComplete) {
    var config = {
      params: { url: encodeURIComponent(javadocUrl) }
    };
    $http.get('./packages', config).then(function(response) {
      onComplete(response.data);
    });
  };

  service.retrieveRelatives = function(javadocUrl, onComplete) {
    var config = {
      params: { url: encodeURIComponent(javadocUrl) }
    };
    $http.get('./relatives', config).then(function(response) {
      onComplete(response.data);
    })
  };

  return service;
}]);


app.service('constants', [function() {
  var service = {};

  service.metadata = {
    CLASSES: 'Classes',
    PACKAGES: 'Packages'
  };

  service.tryValidateMetadataType = function(type) {
    if (type != service.metadata.CLASSES && type != service.metadata.PACKAGES) {
      throw 'Invalid type: ' + type;
    }
  };

  return service;
}]);


app.service('searchDataLocator', ['constants', function(constants) {

  var service = {};

  var searchData = {};

  service.setSearchData = function(searchData, type) {
    constants.tryValidateMetadataType(type);
    searchData[type] = searchData;
  };

  service.getSearchData = function(type) {
    constants.tryValidateMetadataType(type);
    return searchData[type];
  };

  return service;
}]);


app.service('indexLocator', ['constants', function(constants) {

  var service = {};

  var indexes = {};

  service.createIndex = function(values, type) {
    constants.tryValidateMetadataType(type);
    indexes[type] = new BinaryTree(values);
  };

  service.getIndex = function(type) {
    constants.tryValidateMetadataType(type);
    return indexes[type];
  };


  function BinaryTree(sortedValues) {
    this._root = null;

    var rightIndex = Math.round(sortedValues.length / 2);
    var leftIndex = rightIndex - 1;

    for (var i = rightIndex; i < sortedValues.length; i++) {
      this.add(sortedValues[i]);
    }
    for (i = leftIndex; i >= 0; i--) {
      this.add(sortedValues[i]);
    }
  }
  BinaryTree.prototype = {

    add: function(value) {
      var node = new Node(value);
      var current = null;

      if (this._root === null) {
        this._root = node;
      }
      else {
        current = this._root;

        var nodeInserted = false;
        while (!nodeInserted) {
          if (value < current.value) {
            if (current.left === null) {
              current.left = node;
              nodeInserted = true;
            }
            else {
              current = current.left;
            }
          }
          else if (value > current.value) {
            if (current.right === null) {
              current.right = node;
              nodeInserted = true;
            }
            else {
              current = current.right;
            }
          }
          else {
            throw 'This code should never be reached.'
          }
        }
      }
    }

  };


  function Node(value) {
    this.value = value;
  }
  Node.prototype = {
    left: null,
    right: null
  };

  return service;
}]);
