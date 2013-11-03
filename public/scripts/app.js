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

    for(var i = 0; i < board.length; i++) {
      html += '<tr>';
      for(var j = 0; j < board.length; j++) {
        styleClass = '';
        symbol = '';

        if (board[i][j] === CROSS) {
          styleClass = 'cross';
          symbol = 'X';
        } else if (board[i][j] === NOUGHT) {
          styleClass = 'nought';
          symbol = 'O';
        }

        html += '<td --data-x="' + i + '" --data-y="' + j + '" ' +
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

  $start.on('click', function(event) {
    event.preventDefault();

    $info.text('');
    $team.text('');
    socket.emit('startGame');
    updateText($status, 'Trying to create new game...');
  });
});