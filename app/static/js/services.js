'use strict';

app.service('javadocService', ['$http', function($http) {

  var service = {};

  service.retrieveClasses = function(encodedUrl, onComplete) {
    var config = {
      params: { url: encodedUrl }
    };
    $http.get('./classes', config).then(function(response) {
      onComplete(response.data);
    });
  };

  service.retrievePackages = function(encodedUrl, onComplete) {
    var config = {
      params: { url: encodedUrl }
    };
    $http.get('./packages', config).then(function(response) {
      onComplete(response.data);
    });
  };

  service.retrieveRelatives = function(encodedUrl, onComplete) {
    var config = {
      params: { url: encodedUrl }
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

  service.setSearchData = function(data, type) {
    constants.tryValidateMetadataType(type);
    searchData[type] = data;
  };

  service.getSearchData = function(type) {
    constants.tryValidateMetadataType(type);
    return searchData[type];
  };

  return service;
}]);


app.service('indexLocator', ['$log', 'constants', function($log, constants) {

  var service = {};

  var indexes = {};

  service.createIndex = function(values, type) {
    constants.tryValidateMetadataType(type);
    indexes[type] = new BinarySearchTree(values);
  };

  service.getIndex = function(type) {
    constants.tryValidateMetadataType(type);
    return indexes[type];
  };


  function BasicMatcher(sortedValues) {
    $log.debug("Creating BasicMatcher");
    this.values = sortedValues;
  }
  BasicMatcher.prototype.getMatchingFunction = function() {
    var thisBasicMatcher = this;
    return function findMatches(q, cb) {
      $log.debug("findMatches got called. q = ", q);
      var matches = [];
      var regex = new RegExp(q, 'i');

      _.each(thisBasicMatcher.values, function (str) {
        if (regex.test(str)) {
          matches.push({ value: str });
        }
      });

      cb(matches);
    }
  };


  function BinarySearchTree(sortedValues) {
    this.root = null;

    var rightIndex = Math.round(sortedValues.length / 2);
    var leftIndex = rightIndex - 1;

    for (var i = rightIndex; i < sortedValues.length; i++) {
      this.add(sortedValues[i]);
    }
    for (i = leftIndex; i >= 0; i--) {
      this.add(sortedValues[i]);
    }
  }
  BinarySearchTree.prototype = {

    add: function(value) {
      var node = new Node(value);
      var current = null;

      if (this.root === null) {
        this.root = node;
      }
      else {
        current = this.root;

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
    },

    getMatchingFunction: function() {
      var thisBinarySearchTree = this;
      return function findMatches(pattern, cb) {
        pattern = pattern.toLowerCase();
        var nodeCount = 0;
        var matches = [];
        var regex = new RegExp(pattern, 'i');

        function traverse(node) {
          nodeCount++;
          if (node) {
            if (regex.test(node.value)) {
              matches.push({ value: node.value });
              if (matches.length > 20) {
                return;
              }
            }

            if (node.left !== null && node.right !== null) {
              if (regex.test(node.left.value) && regex.test(node.right.value)) {
                $log.log("Left and Right match");
              }
            }

            if (node.value < pattern && node.left !== null) {
              traverse(node.left);
            }
            if (node.value > pattern && node.right !== null) {
              traverse(node.right);
            }
          }
        }

        traverse(thisBinarySearchTree.root);

        $log.log("Checked ", nodeCount, " nodes.");
        cb(matches);
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
