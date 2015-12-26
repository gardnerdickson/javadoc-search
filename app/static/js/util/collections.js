
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



function Cache(limit) {
  this.limit = limit;
  this.orderedMap = new OrderedMap();
}

Cache.prototype.put = function(key, object) {
  if (this.orderedMap.contains(key)) {
    this.orderedMap.remove(key);
  }

  while (this.orderedMap.size() > this.limit) {
    this.orderedMap.remove(this.orderedMap.getFirstKey());
  }

  this.orderedMap.put(key, object);
};

Cache.prototype.get = function(key) {
  return this.orderedMap.get(key);
};

Cache.prototype.contains = function(key) {
  if (this.orderedMap.size() === 0) {
    return false;
  }

  return this.orderedMap.contains(key);
};

