'use strict';

app.service('javadocService', ['$http', function($http) {

  var service = {};

  service.setBaseJavadocUrl = function(encodedUrl, onComplete) {
    var data = { baseUrl: encodedUrl };
    $http.post('./baseUrl', data).then(function() {
      onComplete();
    })
  };

  service.retrieveClasses = function(onComplete) {
    $http.get('./classes').then(function(response) {
      onComplete(response.data);
    });
  };

  service.retrievePackages = function(onComplete) {
    $http.get('./packages').then(function(response) {
      onComplete(response.data);
    });
  };

  service.retrieveRelatives = function(encodedClassRelativeUrl, onComplete) {
    var config = {
      params: { classRelativeUrl: encodedClassRelativeUrl }
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

  service.search = {
    MAX_RESULTS: 30
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


app.service('matcherLocator', ['$log', 'constants', function($log, constants) {

  var service = {};

  var indexes = {};

  service.createMatcher = function(values, type) {
    if (type === 'Basic') {
      indexes[type] = new BasicMatcher(values, constants.search.MAX_RESULTS)
    }
    else if (type === 'CamelCase') {
      indexes[type] = new CamelCaseMatcher(values, constants.search.MAX_RESULTS)
    }
    else {
      throw "Invalid matcher type: " + type;
    }
  };

  service.getMatcher = function(type) {
    return indexes[type];
  };


  function BasicMatcher(sortedValues, maxResults) {
    $log.debug("Creating BasicMatcher");
    this._values = sortedValues;
    this._maxResults = maxResults;
  }
  BasicMatcher.prototype = {

    maxResults: function(value) {
      if (value === undefined) {
        return this._maxResults;
      }
      this._maxResults = value;
    },

    findMatches: function(query) {
      var matches = [];
      var regex = new RegExp(query, 'i');
      $log.debug("values length: " , this._values.length);

      for (var i = 0; i < this._values.length; i++) {
        if (regex.test(this._values[i])) {
          matches.push({ value: this._values[i] });
          if (matches.length >= this._maxResults) {
            return matches;
          }
        }
      }

      return matches;
    }
  };


  function CamelCaseMatcher(values, maxResults) {
    this._values = values;
    this._maxResults = maxResults;
  }
  CamelCaseMatcher.prototype = {

    maxResults: function(value) {
      if (value === undefined) {
        return this._maxResults;
      }
      this._maxResults = value;
    },

    findMatches: function(pattern) {
      var matches = [];
      var regex = new RegExp(pattern);

      for (var i = 0; i < this._values.length; i++) {
        if (regex.test(this.getCamelCaseValue(this._values[i]))) {
          matches.push({ value: this._values[i] });
          if (matches.length >= this._values[i]) {
            return matches;
          }
        }
      }

      return matches;
    },

    getCamelCaseValue: function(str) {
      var upperCaseValue = '';
      for (var i = 0; i < str.length; i++) {
        var char = str.charAt(i);
        if (char === char.toUpperCase()) {
          upperCaseValue += char;
        }
      }
      return upperCaseValue;
    }
  };


  function BinarySearchTree(sortedValues, maxResults) {
    this._root = null;
    this._maxResults = maxResults;

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
    },

    maxResults: function(value) {
      if (value === undefined) {
        return this._maxResults;
      }

      this._maxResults = value;
    },

    getMatchingFunction: function() {
      var thisBinarySearchTree = this;
      return function findMatches(pattern, cb) {
        pattern = pattern.toLowerCase();
        var nodeCount = 0;
        var matches = [];
        var regex = new RegExp(pattern, 'i');

        function traverse(node) {
          if (matches.length >= thisBinarySearchTree._maxResults) {
            return;
          }

          nodeCount++;
          if (node) {

            if (node === thisBinarySearchTree._root) {
              if (regex.test(node.value)) {
                matches.push({ value: node.value });
              }
            }
            else {
              matches.push({ value: node.value });
            }

            if (node.left !== null && regex.test(node.left.value)) {
              traverse(node.left);
            }
            if (node.right !== null && regex.test(node.right.value)) {
              traverse(node.right);
            }
          }
        }

        traverse(thisBinarySearchTree._root);

//        $log.log("Checked ", nodeCount, " nodes.");
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
