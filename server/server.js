var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('update:connect','connecté');
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});
