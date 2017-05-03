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

var players = [];

var addToPlayersArray = function (player) {

}

var current_word = words[0];

var counter = 0;

io.on('connection', function (socket) {

  var player = null;

  socket.on('join', function (name) {
    player = new Player().setId(socket.id).setName(name).setPoints(0);
    players.push(player);
    console.log(player.name + ' joined');
    console.log(players.length);
  });

  if (players.length < 2) {
    io.emit('status', 'Waiting for more players to join...');
  } else {
    io.emit('status', 'a new player joined the game');
  }

  socket.on('disconnect', function () {
    players.splice(findElement(players, 'id', socket.id), 1);
    io.emit('status', player.name + ' left the game');
    console.log('player left')
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

  var sendNewWordOut = function () {
    io.emit('new_word', current_word);
  }

  var sendLeaderboard = function () {
    io.emit('leaderboard', players);
  }

  function findElement(arr, propName, propValue) {
    for (var i = 0; i < arr.length; i++)
      if (arr[i].id == propValue)
        return arr[i];
  }

  var addPoints = function (check_word, id) {
    var obj = findElement(players, 'id', id);
    obj.points += check_word.length;
  }

  socket.on("send_input", function (check_word) {
    if (current_word == check_word) {
      console.log(players);
      console.log(players.lenght);
      io.emit('status', player.name + ' won the last round');
      addPoints(check_word, socket.id);
      setNewWord();
      sendNewWordOut();
      sendLeaderboard();
    }
  });

});




