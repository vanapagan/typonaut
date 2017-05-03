var express = require('express');
var app = express();
var fs = require('fs');
// var http = require('http').Server(app);
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var port = 3000;

// app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(port);
console.log('Server started at http://localhost:' + port);

/*
http.listen(3000, function () {
  console.log('listening on *:3000');
});*/

var words = ['dog', 'cat', 'hello', 'money', 'spider', 'computer'];
var index = 0;

var clients = [];

var current_word = words[0];

var counter = 0;

io.on('connection', function (socket) {

  clients.push({ 'id': socket.id, 'name': 'player' + counter++, 'points': 0 });
  console.log('player joined');

  if (clients.length < 2) {
    io.emit('status', 'Waiting for more players to join...');
  } else {
    io.emit('status', findElement(clients, 'id', socket.id).name + ' joined the game');
  }

  socket.on('disconnect', function () {
    clients.splice(findElement(clients, 'id', socket.id), 1);
    io.emit('status', 'player left the game');
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
    io.emit('leaderboard', clients);
  }

  function findElement(arr, propName, propValue) {
    for (var i = 0; i < arr.length; i++)
      if (arr[i][propName] == propValue)
        return arr[i];
  }

  var addPoints = function (check_word, id) {
    var obj = findElement(clients, 'id', id); 
    obj.points += check_word.length;
  }

  socket.on("send_input", function (check_word) {
    if (current_word == check_word) {
      io.emit('status', findElement(clients, 'id', socket.id).name + ' won the last round');
      addPoints(check_word, socket.id);
      setNewWord();
      sendNewWordOut();
      sendLeaderboard();
    }
  });

});


