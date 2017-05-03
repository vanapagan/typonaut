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
  console.log(index);
  this.players.splice(index, 1);
  console.log(this.players);
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

var players = new Collection();
var current_word = words[0];

io.on('connection', function (socket) {

  var player = null;

  socket.on('join', function (name) {
    socket.name = name;
    socket.points = 0;
    players.addPlayer(new Player().setId(socket.id).setName(name).setPoints(0));
    io.emit('status', socket.name + ' joined');
  });

  if (players.length < 2) {
    io.emit('status', 'Waiting for more players to join...');
  } else {
    io.emit('status', 'a new player joined the game');
  }

  socket.on('disconnect', function () {
    if (socket.name != null) {
      players.removePlayer(players.getPlayerIndex(socket.id));
      io.emit('status', socket.name + ' left the game');
      console.log(socket.name + ' left the game');
    }
  });

  io.emit('new_word', current_word);

  var setNewWord = function () {
    index++;
    if (index <= words.length - 1) {
      current_word = words[index];
    } else {
      index = 0;
      current_word = words[index];
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
      console.log(players.players);
      io.emit('status', socket.name + ' won the last round');
      players.addPoints(players.getPlayer(socket.id), check_word);
      setNewWord();
      broadcastNewWord();
      broadcastLeaderboard();
    }
  });

});




