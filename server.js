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
var one = false;



var current_word = words[0];

io.sockets.on('connection', function (socket, client) {

  clients.push(client);
  io.emit('status', socket.id + ' joined the game');

  socket.on('disconnect', function () {
    clients.splice(clients.indexOf(client), 1);
    io.emit('status', socket.id + ' left the game');
  });

  io.emit('new_word', current_word);

  var setNewWord = function () {
    index++;
    if (index <= words.length - 1) {
      current_word = words[index];
    } else {
      current_word = 'GAME OVER!';
    }
  }

  var sendNewWordOut = function () {
    io.emit('new_word', current_word);
  }

  socket.on("send_input", function (check_word) {
    if (current_word == check_word) {
      io.emit('status', socket.id + ' won the last round');
      setNewWord();
      sendNewWordOut();
    }
  });

});

