var app = require('express')();
var http = require('http').Server(app);
var path = require('path');

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});
