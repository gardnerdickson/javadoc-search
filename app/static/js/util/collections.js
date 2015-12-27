
function OrderedMap() {
  this.map = {};
  this._order = [];
}

OrderedMap.prototype.put = function(key, object) {
  this.map[key] = object;
  this._order.push(key);
};

OrderedMap.prototype.get = function(key) {
  return this.map[key];
};

OrderedMap.prototype.getFirstKey = function() {
  if (_.isEmpty(this.map)) {
    throw "OrderedMap is empty";
  }

  return this._order[0];
};

OrderedMap.prototype.getLastKey = function() {
  if (_.isEmpty(this.map)) {
    throw "OrderedMap is empty";
  }

  return this._order[this._order.length - 1];
};

OrderedMap.prototype.getKey = function(n) {
  if (n > this._order.length) {
    throw "OrderedMap is size " + this._order.length + ". Asked for " + n + "th key.";
  }

  return this._order[n];
};

OrderedMap.prototype.remove = function(key) {
  if (this.map[key] !== undefined) {
    var orderIndex = _.indexOf(this._order, key);
    this._order.splice(orderIndex, 1);
    delete this.map[key];
  }
  else {
    throw "OrderedMap does not contain key " + key;
  }
};

OrderedMap.prototype.contains = function(key) {
  return this.map[key] !== undefined;
};

OrderedMap.prototype.size = function() {
  return this._order.length;
};


// TODO(gdickson): Can this be put into the service or factory?
function LoadingCache(config) {
  this.orderedMap = new OrderedMap();

  this.limit = config.limit || 10;

  if (config.load === undefined || !_.isFunction(config.load)) {
    throw "config parameter must contain a 'load' property that is a function."
  }
  this.load = config.load;
}

LoadingCache.prototype.get = function(key) {

  var that = this;
  function put(key) {
    while (that.orderedMap.size() > that.limit) {
      that.orderedMap.remove(that.orderedMap.getFirstKey());
    }

    return that.load(key).then(function(data) {
      that.orderedMap.put(key, data);
      return data;
    });
  }

  var value = this.orderedMap.get(key);
  if (value === undefined) {
    return put(key);
  }
  else {
    return Promise.resolve(that.orderedMap.get(key));
  }
};

