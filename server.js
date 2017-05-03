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

//Socket connection handler
io.on('connection', function (socket, client) {
  console.log('player joined');
  clients.push(client);

  if (clients.length < 2) {
    io.emit('status', 'Waiting for other players to join...');
  } else {
    io.emit('status', socket.id + ' joined the game');
  }

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
    console.log('received player input');
    if (current_word == check_word) {
      io.emit('status', socket.id + ' won the last round');
      setNewWord();
      sendNewWordOut();
    }
  });

});

/*
io.sockets.on('connection', function (socket, client) {

  clients.push(client);

  if (clients.length < 2) {
    io.emit('status', 'Waiting for other players to join...');
  } else {
    io.emit('status', socket.id + ' joined the game');
  }

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

  socket.on("test", function (check_word) {
    console.log('check_word');
  });


});*/

