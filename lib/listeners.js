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

        if (!data || !data.gameId || !data.playerIndex) {
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
  },
  turn: function(connection, turn) {
    if (!turn || !turn.x || !turn.y) {
      return console.error('Not enough parameters');
    }

    Player.prototype.getData.call({ connection: connection },
      ['gameId', 'playerIndex'],
      function(err, data) {
        var game,
            player;

        if (err) {
          console.error(err);
        }
        
        game = (data && data.gameId !== null) ?
          app.storage.findGame(data.gameId) : null;
        player = (game) ? game.players[data.playerIndex] : null;

        if (!game) {
          return console.error('game not found', data.gameId);
        }
        if (!player) {
          return console.error('player not found', data.gameId,
            data.playerIndex);
        }
        if (game.currentTeam !== player.team ||
            game.board[turn.x][turn.y] !== 0) {
          return;
        }

        game.turn(turn.x, turn.y);
      }
    );
  }
};

module.exports = listeners;