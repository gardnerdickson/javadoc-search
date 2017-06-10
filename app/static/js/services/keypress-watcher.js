
app.service('keyPressWatcher', ['$log', function($log) {

  var service = {};

  service.events = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
    BACKSPACE: 'backspace',
    PRINTABLE: 'printable',
    ENTER: 'enter',
    ESC: 'esc'
  };

  var handlerConfigs = {};

  service.register = function(handlerConfig, category) {
    tryValidateHandlers(handlerConfig);

    var prefix = category !== undefined ? category + '_' : 'id_';
    var uniqueId = _.uniqueId(prefix);
    handlerConfigs[uniqueId] = handlerConfig;
    return uniqueId;
  };

  service.unregister = function(uniqueId) {
    delete handlerConfigs[uniqueId];
  };

  function tryValidateHandlers(handlers) {
    _.each(_.keys(handlers), function(eventKey) {
      if (!_.contains(_.values(service.events), eventKey)) {
        throw eventKey + " is not a valid key press event";
      }
    });
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
    else {
      $log.warn("Unsupported key press code: ", code);
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

    _.each(_.values(handlerConfigs), function(handlerConfig) {
      if (_.has(handlerConfig, keyEvent)) {
        handlerConfig[keyEvent](event.which);
      }
    });
  });


  return service;
}]);
