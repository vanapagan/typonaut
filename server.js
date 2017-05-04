var express = require('express');
var app = express();
var fs = require('fs');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var port = 3000;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(port);
console.log('Server started at http://localhost:' + port);

// var words = ['cow', 'dog', 'cat', 'hello', 'money', 'spider', 'computer'];
var words = ['dog', 'cat'];
var index = 0;

var Collection = function () {
  this.players = [];
};

Collection.prototype.addPlayer = function (player) {
  this.players.push(player);
  return this;
};

Collection.prototype.getPlayer = function (id) {
  for (var i = 0; i < this.players.length; i++) {
    if (this.players[i].id == id) {
      return this.players[i];
    }
  }
  return null;
}

Collection.prototype.getPlayerIndex = function (id) {
  for (var i = 0; i < this.players.length; i++) {
    if (this.players[i].id == id) {
      return i;
    }
  }
  return -1;
}

Collection.prototype.removePlayer = function (index) {
  return this.players.splice(index, 1);
}

Collection.prototype.addPoints = function (player, word) {
  if (player != null && word != null) {
    player.points += word.length;
  }
}

Collection.prototype.getWinner = function () {
  if (this.players != null && this.players.length > 0) {
    if (this.players.length == 1) {
      return this.players[0];
    } else {
      var maxPlayer = new Player().setId('tempplayerid').setName('tempplayername').setPoints(0);
      var secMaxPlayer = new Player().setId('tempplayerid2').setName('tempplayername2').setPoints(0);

      for (var i = 0; i < this.players.length; i++) {
        if (maxPlayer.points < this.players[i].points) {
          secMaxPlayer = maxPlayer;
          maxPlayer = this.players[i];
        } else if (secMaxPlayer.points < this.players[i].points) {
          secMaxPlayer = this.players[i];
        }
      }

      if (maxPlayer != null && secMaxPlayer != null && maxPlayer.points == secMaxPlayer.points) {
        return 'draw';
      } else {
        return maxPlayer;
      }
    }
  } else {
    return -1;
  }
}

var Player = function () {
  this.id = '';
  this.name = '';
  this.points = 0;
};

Player.prototype.setId = function (id) {
  this.id = id;
  return this;
};

Player.prototype.setName = function (name) {
  this.name = name;
  return this;
};

Player.prototype.setPoints = function (points) {
  this.points = points;
  return this;
};

var gameStarted = false;

var players = new Collection();
var current_word = words[0];

var winnderDisplayed = false;

io.on('connection', function (socket) {

  socket.emit('welcome', 'Welcome!');

  var player = null;

  function gameStarting() {
    setTimeout(function () {
      io.emit('status', 'Game starts in 2 seconds...');
      startGame();
    }, 1000);
  };

  function startGame() {
    setTimeout(function () {
      current_word = words[0]
      io.emit('game', 'started');
      io.emit('status', 'Game has started. Good luck!');
      io.emit('new_word', current_word);
    }, 2000);
  }

  socket.on('join', function (name) {
    socket.name = name;
    if (!gameStarted && players.addPlayer(new Player().setId(socket.id).setName(name).setPoints(0)).players.length < 2) {
      socket.emit('accepted', 'yes');
      socket.emit('status', 'Waiting for more players to join...');
    } else if (!gameStarted) {
      gameStarted = true;
      console.log(players.players);
      socket.emit('accepted', 'yes');
      io.emit('status', name + ' joined the game');
      gameStarting();
    } else {
      socket.emit('welcome', 'Sorry the game has already started');
    }
  });

  function setGameStartedFalseIn1Second() {
    setTimeout(function () {
      gameStarted = false;
    }, 1000);
  };

  socket.on('disconnect', function () {
    if (socket.name != null) {
      io.emit('status', socket.name + ' left the game');
      if (players.removePlayer(players.getPlayerIndex(socket.id)).length < 2) {
        io.emit('game', 'ended');
        if (!winnderDisplayed) {
          winnderDisplayed = true;
          io.emit('endgame', players.getWinner());
        }
        if (players.players.length == 0) {
          gameStarted = false;
          winnderDisplayed = false;
          current_word = words[0];
          index = 0;
          console.log('no players anymore');
        }
      }
    }
  });

  var setNewWord = function () {
    console.log(index);
    index++;
    console.log(index);
    if (index <= words.length - 1) {
      current_word = words[index];
    } else {
      io.emit('game', 'ended');
      if (!winnderDisplayed) {
        winnderDisplayed = true;
        index = 0;
        current_word = words[0];
        io.emit('endgame', players.getWinner());
      }
    }
  }

  var broadcastNewWord = function () {
    io.emit('new_word', current_word);
  }

  var broadcastLeaderboard = function () {
    io.emit('leaderboard', players.players);
  }

  socket.on("send_input", function (check_word) {
    if (current_word == check_word) {
      io.emit('status', socket.name + ' won the last round');
      players.addPoints(players.getPlayer(socket.id), check_word);
      setNewWord();
      broadcastNewWord();
      broadcastLeaderboard();
    }
  });

});




