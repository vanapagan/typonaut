var express = require('express');
var app = require('express')();
var fs = require('fs');
var http = require('http').Server(app);

app.use(express.static('public'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var io = require('socket.io').listen(http);
fs.readFile(__dirname + '/wordlist.txt', 'utf-8', function (err, data) {
  if (err) {
    console.log(err);
  }
  var word_list = data.toString().split('\n');
  var players = 0;
  var p1_points = 0;
  var p2_points = 0;
  var one = false;
  io.sockets.on('connection', function (socket) {
    if (one == false) {
      socket.id = 1;
      one = true;
    } else {
      socket.id = 2;
      one = false;
    }

    socket.on('disconnect', function (r) {
      if (socket.id == 1) {
        p1_points = 0;
        one = false;
      } else {
        p2_words = [];
        p2_points = 0;
        one = true;
      }
    });

    socket.on("check_word", function (check_word) {

    });

  });

});

/*
var answered = false;
var clients = [];

io.sockets.on('connection', function (socket) {
  console.log('a player connected');

  clients.push(socket.id);
  console.log('id ' + socket.id);

  io.emit('new_word', "new word");

  socket.on('disconnect', function () {
    console.log('a player disconnected');
  });
  socket.on('chat message', function (msg) {
    console.log('message: ' + msg);
  });
  socket.on('send', function (msg) {
    io.emit('new_word', "new new word");
    socket.broadcast.to(socket.id).emit('new_word', 'You won!');
    if (!answered) {
      console.log('rerer');
      console.log('idd:' + socket.id);
      socket.broadcast.to(socket.id).emit('new_word', 'You won!');
    } else {
      socket.broadcast.to(socket.id).emit('new_word', 'You lost!');
    }
  });
});
*/
