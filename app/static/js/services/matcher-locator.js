
app.service('matcherLocator', ['$log', 'constants', function($log, constants) {

  var service = {};

  var indexes = {};

  service.createMatcher = function(values, type, key) {
    if (type === 'Basic') {
      indexes[key] = new BasicMatcher(values, constants.search.MAX_RESULTS)
    }
    else if (type === 'CamelCase') {
      indexes[key] = new CamelCaseMatcher(values, constants.search.MAX_RESULTS);
    }
    else if (type === 'Fuzzy') {
      indexes[key] = new FuzzyMatcher(values, constants.search.MAX_RESULTS);
    }
    else {
      throw "Invalid matcher type: " + type;
    }
  };

  service.getMatcher = function(key) {
    return indexes[key];
  };


  function FuzzyMatcher(values, maxResults) {
    this._values = values;
    this._maxResults = maxResults;

    this.fuse = new Fuse(this._values);
  }
  FuzzyMatcher.prototype = {

    findMatches: function(query) {
      var fuseResult = this.fuse.search(query);

      var searchResultIndexes = fuseResult.splice(0, 30);
      var searchResults = [];
      for (var i in searchResultIndexes) {
        searchResults.push(this._values[searchResultIndexes[i]]);
      }

      return searchResults;
    }

  };

  function BasicMatcher(sortedValues, maxResults) {
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

      for (var i = 0; i < this._values.length; i++) {
        if (regex.test(this._values[i])) {
          matches.push(this._values[i]);
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
      var matches = {};
      var regex = new RegExp(pattern);

      // test keys for matches
      var keys = _.keys(this._values);
      for (var i = 0; i < keys.length; i++) {
        if (regex.test(this.getCamelCaseValue(keys[i]))) {
          matches = this._values[keys[i]];
          if (matches.length >= keys[i]) {
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
