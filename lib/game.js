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

Game.prototype.turn = function(x, y) {
  var draw;

  this.turnsCount++;
  this.board[x][y] = this.currentTeam;

  if (this.checkCompletion()) {
    return this.finish({
      reason: 'complete',
      winner: this.currentTeam,
      board: this.board
    });
  } else {
    draw = this.turnsCount === (this.board.length * this.board.length);
    
    if (draw) {
      return this.finish({
        reason: 'complete',
        winner: -1,
        board: this.board
      });
    }
  }

  this.currentTeam = (this.currentTeam === Game.CROSS) ? Game.NOUGHT :
    Game.CROSS;
  this.stateChanged();
};

Game.prototype.finish = function(data, callback) {
  var _this = this,
      cleanConnectionData = {
    gameId: null,
    playerIndex: null
  };

  callback = callback || function(err) {
    if (err) {
      console.error(err);
    }
  };

  async.forEach(this.players, function(player, cb) {
    player.setData(cleanConnectionData, cb);
  }, function(err) {
    if (err) {
      console.error(err);
    }

    for(var key in _this.players) {
      _this.players[key].send('gameFinished', data);
    }

    app.storage.removeGame(_this);

    callback();
  });
};

Game.prototype.checkCompletion = function() {
  var _this = this,
      checkDiagonals,
      checkHorizontals,
      checkVerticals;

  if (Math.ceil(this.turnsCount / 2) < this.board.length) {
    return false;
  }

  checkDiagonals = function() {
    var diagonals = [
      [[0, 0], [1, 1], [2, 2]],
      [[0, 2], [1, 1], [2, 0]]
    ];

    return diagonals.some(function(diagonal) {
      return diagonal.every(function(field) {
        return _this.board[field[0]][field[1]] === _this.currentTeam;
      });
    });
  };

  checkHorizontals = function() {
    return _this.board.some(function(horizontal) {
      return horizontal.every(function(field) {
        return field === _this.currentTeam;
      });
    });
  };

  checkVerticals = function() {
    var winning;

    for(var y = 0; y < _this.board.length; y++) {
      winning = true;
      for(var x = 0; x < _this.board.length; x++) {
        if (_this.board[x][y] !== _this.currentTeam) {
          winning = false;
          break;
        }
      }
      if (winning) {
        return winning;
      }
    }

    return false;
  };

  return checkHorizontals() || checkVerticals() || checkDiagonals();
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