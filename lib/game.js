var async = require('async');

var Game = function() {
  this.id = Game.prototype.incrementedId++;
  this.currentTeam = Game.CROSS;
  this.turnsCount = 0;
  this.players = [];

  this.createBoard();
  
  app.storage.games.push(this);
};

Game.CROSS = 1;
Game.NOUGHT = 2;

Game.prototype.incrementedId = 0;

Game.prototype.createBoard = function() {
  this.board = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
};

Game.prototype.addPlayer = function(player) {
  var _this = this,
      connectionData;

  if (!this.players.length) {
    player.team = Game.CROSS;
  } else {
    player.team = Game.NOUGHT;
  }
  
  this.players.push(player);

  connectionData = {
    gameId: this.id,
    playerIndex: this.players.indexOf(player)
  };

  player.setData(connectionData, function(err) {
    if (err) {
      console.error(err);
    }

    if (_this.players.length === 2) {
      for(var key in _this.players) {
        _this.players[key].send('gameStarted', {
          team: _this.players[key].team
        });
      }
      _this.stateChanged();
    } else {
      player.send('waitingForOpponent');
    }
  });

};

Game.prototype.stateChanged = function() {
  var data = {
    board: this.board,
    currentTeam: this.currentTeam
  };

  for(var key in this.players) {
    this.players[key].send('gameStateChanged', data);
  }
};

module.exports = Game;