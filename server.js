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

var words = ['dog', 'cat', 'hello', 'money', 'spider', 'computer'];
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

io.on('connection', function (socket) {

  var player = null;

  function gameStarting() {
    setTimeout(function () {
      io.emit('status', 'Game starts in 2 seconds...');
      startGame();
    }, 1000);
  };

  function startGame() {
    setTimeout(function () {
      gameStarted = true;
      current_word = words[0]
      io.emit('game', 'started');
      io.emit('status', 'Game has started. Good luck!');
      io.emit('new_word', current_word);
    }, 2000);
  }

  socket.on('join', function (name) {
    socket.name = name;
    if (players.addPlayer(new Player().setId(socket.id).setName(name).setPoints(0)).players.length < 2) {
      socket.emit('status', 'Waiting for more players to join...');
    } else {
      io.emit('status', name + ' joined the game');
      gameStarting();
    }
  });

  socket.on('disconnect', function () {
    if (socket.name != null) {
      io.emit('status', socket.name + ' left the game');
      if (players.removePlayer(players.getPlayerIndex(socket.id)).length < 2) {
        io.emit('game', 'ended');
      }
    }
  });

  var setNewWord = function () {
    index++;
    if (index <= words.length - 1) {
      current_word = words[index];
    } else {
      
      /*
      // enable for infinite looping
      index = 0;
      current_word = words[index];*/
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




