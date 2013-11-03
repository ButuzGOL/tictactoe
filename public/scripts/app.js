$(function() {
  var socket = io.connect('localhost'),
      team = 0,
      turnTeam = 0,
      CROSS = 1,
      NOUGHT = 2,
      $start = $('#start-game'),
      $team = $('#team'),
      $info = $('#info'),
      $board = $('#board > table'),
      $status = $('#status');

  $start.hide();

  $status.text('Connecting to server...');

  var redrawBoard = function(board) {
    var html = '',
        styleClass,
        symbol;

    for(var x = 0; x < board.length; x++) {
      html += '<tr>';
      for(var y = 0; y < board.length; y++) {
        styleClass = '';
        symbol = '';

        if (board[x][y] === CROSS) {
          styleClass = 'cross';
          symbol = 'X';
        } else if (board[x][y] === NOUGHT) {
          styleClass = 'nought';
          symbol = 'O';
        }

        html += '<td --data-x="' + x + '" --data-y="' + y + '" ' +
          'class="' + styleClass + '">' +
            symbol +
          '</td>';
      }
    }
    
    $board.html(html);
  };

  var updateText = function($block, message) {
    $block.hide();
    $block.html(message);
    $block.fadeIn();
  };
  
  socket.on('connect', function() {
    $start.show();
    updateText($status, 'Connection established');

    $('#board').on('click', 'td', function() {
      if (team !== turnTeam || $(this).attr('class') !== '') {
        return;
      }
      
      socket.emit('turn', {
        x: $(this).attr('--data-x'),
        y: $(this).attr('--data-y')
      });
    });
  });

  socket.on('gameStateChanged', function(data) {
    turnTeam = data.currentTeam;

    redrawBoard(data.board);
    updateText($info, 'Now is ' +
      ((team === turnTeam) ? 'your turn' : 'your opponent\'s turn'));
  });

  socket.on('gameStarted', function(data) {
    team = data.team;
    
    updateText($team, 'You are playing for ' + ((team === CROSS) ? 'X' : 'O'));
    updateText($status, 'Game started');
  });

  socket.on('gameFinished', function(data) {
    var message;

    turnTeam = 0;

    if (data.winner === team) {
      message = '<span class="good">You win!</span>';
    } else if (data.winner === -1) {
      message = 'Draw! -_-';
    } else {
      message = '<span class="bad">You lose!</span>';
    }

    redrawBoard(data.board);
    updateText($info, message);
  });

  $start.on('click', function(event) {
    event.preventDefault();

    $info.text('');
    $team.text('');
    socket.emit('startGame');
    updateText($status, 'Trying to create new game...');
  });
});