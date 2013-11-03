var async = require('async');

var Player = function(connection) {
  this.connection = connection;
  this.team = 0;
};

Player.prototype.send = function(eventName, data) {
  this.connection.emit(eventName, data);
};

Player.prototype.setData = function(data, callback) {
  var _this = this;

  async.forEach(Object.keys(data), function(key, cb) {
    _this.connection.set(key, data[key], cb);
  }, callback);
};

Player.prototype.getData = function(keys, callback) {
  var parallels = {};

  for(var key in keys) {
    parallels[keys[key]] = this.connection.get.bind(this.connection, keys[key]);
  }
  
  async.parallel(parallels, callback);
};

module.exports = Player;