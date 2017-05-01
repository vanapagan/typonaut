var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var answered = false;
var clients = [];

io.sockets.on('connection', function(socket){
  console.log('a player connected');

  clients.push(socket.id);
  console.log('id ' + socket.id);

  io.emit('new_word', "new word");

  socket.on('disconnect', function(){
    console.log('a player disconnected');
  });
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
  socket.on('send', function(msg){
    io.emit('new_word', "new new word");
    socket.broadcast.to(socket.id).emit('new_word','You won!');
    if (!answered) {
        console.log('rerer');
        console.log('idd:' + socket.id);
        socket.broadcast.to(socket.id).emit('new_word','You won!');
    } else {
        socket.broadcast.to(socket.id).emit('new_word','You lost!');
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});