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


app.service('keyPressWatcher', ['$log', function($log) {

  var service = {};

  service.events = {
    UP: 'Up',
    DOWN: 'Down',
    LEFT: 'Left',
    RIGHT: 'Right',
    BACKSPACE: 'Backspace',
    PRINTABLE: 'Printable',
    ENTER: 'Enter',
    ESC: 'Esc'
  };

  var handlers = {};

  service.addHandler = function(keyPressEvent, callback, uniqueId) {
    tryValidateKeyPressEvent(keyPressEvent);

    if (uniqueId === undefined) {
      uniqueId = _.unique();
    }

    if (!_.has(handlers, keyPressEvent)) {
      handlers[keyPressEvent] = [];
    }

    handlers[keyPressEvent].push({
      callback: callback,
      uniqueId: uniqueId
    });
  };

  service.removeHandler = function(keyPressEvent, uniqueId) {
    tryValidateKeyPressEvent(keyPressEvent);

    for (var i = 0; i < handlers[keyPressEvent].length; i++) {
      if (handlers[keyPressEvent][i].uniqueId === uniqueId) {
        handlers[keyPressEvent].splice(i, 1);
      }
    }
  };

  function tryValidateKeyPressEvent(event) {
    if (!_.contains(_.values(service.events), event)) {
      throw event + " is not a valid key press event";
    }
  }

  function getEvent(code) {
    if (code === 38) {
      return service.events.UP;
    }
    else if (code === 40) {
      return service.events.DOWN;
    }
    else if (code === 37) {
      return service.events.LEFT;
    }
    else if (code === 39) {
      return service.events.RIGHT;
    }
    else if (code === 8) {
      return service.events.BACKSPACE;
    }
    else if (code >= 32 && code <= 126) {
      return service.events.PRINTABLE;
    }
    else if (code === 13) {
      return service.events.ENTER;
    }
    else if (code === 27) {
      return service.events.ESC;
    }
  }


  // capture the keypress
  $(document).on('keydown', function(event) {
    var keyEvent = getEvent(event.which);
    if (keyEvent === service.events.BACKSPACE && !$(event.target).is("input, textarea") ||
        (keyEvent === service.events.UP || keyEvent === service.events.DOWN) ||
        ((keyEvent === service.events.LEFT || keyEvent === service.events.RIGHT) && !$(event.target).is("input, textarea"))) {
      event.preventDefault();
    }

    _.each(handlers[keyEvent], function(handler) {
      handler.callback(event.which);
    });
  });


  return service;
}]);


app.service('constants', [function() {
  var service = {};

  service.metadata = {
    CLASSES: 'Classes',
    PACKAGES: 'Packages'
  };

  service.selectionMode = {
    CLASSES: 'Classes',
    RELATIVES: 'Relatives'
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

