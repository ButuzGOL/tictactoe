global.app = {
  server: {},
  config: require('./config'),
  storage: require('./lib/storage')
};

var express = require('express'),
    http = require('http'),
    expressServer = global.app.server = express(),
    server = http.createServer(expressServer),
    io = (require('socket.io')).listen(server, { 'log level': 1 }),
    listeners = require('./lib/listeners'),
    port;

port = process.env.PORT || app.config.port || 9000;

server.listen(port, function() {
  console.log('tictactoe app running on port ' + port);
});

expressServer.use('/', express.static('./public'));

io.sockets.on('connection', function(socket) {
  var listen = function(actionName) {
        socket.on(actionName, function(data) {
          listeners[actionName](socket, data);
        });
      };

  for(var actionName in listeners) {
    listen(actionName);
  }
});