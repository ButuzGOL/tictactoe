var async = require('async'),
    Player = require('./player'),
    Game = require('./game');

var listeners = {
  startGame: function(connection) {
    var games = app.storage.games,
        player = new Player(connection);

    async.waterfall([
      player.getData.bind(player, ['gameId', 'playerIndex']),
      function(data, next) {
        var oldGame;

        if (!data.gameId || !data.playerIndex) {
          return next();
        }

        oldGame = app.storage.findGame(data.gameId);

        if (oldGame) {
          oldGame.finish({
            reason: 'opponentLeaving',
            team: oldGame.players[data.playerIndex].team
          }, next);
        } else {
          next();
        }
      }
    ], function(err) {
      var game;

      if (err) {
        console.error(err);
      }

      game = games.length ? games[games.length - 1] : null;

      if (!game || game.players.length === 2) {
        game = new Game();
      }
      game.addPlayer(player);
    });
  }
};

module.exports = listeners;