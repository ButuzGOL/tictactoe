var storage = {
  games: [],
  findGame: function(id) {
    for(var key in this.games) {
      if (this.games[key].id === id) {
        return this.games[key];
      }
    }
  },

  removeGame: function(game) {
    var index = this.games.indexOf(game);
    
    if (index !== -1) {
      this.games.splice(index, 1);
    }
  }
};

module.exports = storage;