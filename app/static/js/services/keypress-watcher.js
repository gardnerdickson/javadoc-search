
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

    _.each(handlers[keyEvent], function(handler) {
      handler.callback(event.which);
    });
  });


  return service;
}]);
