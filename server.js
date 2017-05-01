var express = require('express');
var app = require('express')();
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

http.listen(3000, function () {
  console.log('listening on *:3000');
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var words = ['dog', 'cat', 'hello', 'money', 'spider', 'computer'];
var index = 0;

var clients = [];
var p1_points = 0;
var p2_points = 0;
var one = false;

io.sockets.on('connect', function (client) {
  console.log('a player connected');
  clients.push(client);
  console.log('number of players: ' + clients.length);

  client.on('disconnect', function () {
    console.log('a player disconnected');
    clients.splice(clients.indexOf(client), 1);
    console.log('number of players left: ' + clients.length);
  });
});

var current_word = words[0];



io.sockets.on('connection', function (socket) {

  io.emit('new_word', current_word);

  var setNewWord = function () {
    index++;
    if (index <= words.length - 1) {
      current_word = words[index];
    } else {
      current_word = 'GAME OVER!';
    }
    console.log(current_word);
  }

  var sendNewWordOut = function () {
    io.emit('new_word', current_word);
  }

  socket.on("send_input", function (check_word) {
    if (current_word == check_word) {
      setNewWord();
      sendNewWordOut();
    }
  });

});

