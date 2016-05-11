/******* Require et dépendences *******/

var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var nunjucks = require('nunjucks');
var storage = require('node-persist');

/**************************************/
/********* Globales et config *********/

var client_path = path.resolve(__dirname, '../client'); //adresse du dossier client

var userStorage = storage.create(); 

var commands;

var lobbies = [{id: 'ABCD'},{id: 'EFGH'},{id: 'IJKL'}]; //données test
var client = {
  id : "5664615437832391721231523118675217" //données test
};

// Configuration Nunjucks
nunjucks.configure(['views',client_path],{
	autoescape : true,
	express : app,
  noCache  : true   //pour le développement. Force la recompilation du template à chaque apelle
});

// Configuration du storage
userStorage.initSync({
  dir : __dirname + '/data/user'
});
userStorage.setItem('USER_' + client.id, client);
//console.log(userStorage.getItem('USER_' + client.id).id);


/**************************************/
/************** Routing ***************/

app.use(express.static(client_path + '/public')); //
app.get('/', ctrlIndex);

/**************************************/
/************* Controller *************/

//Renvoie la page d'accueil
function ctrlIndex(req, res) {
  res.render('index.html',{
    lobbies: lobbies,
    page: {url: req.protocol + '://' + req.get('host') + req.originalUrl}
  });
}

/**************************************/
/******** Socket.io listeners *********/

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('update:connect','connecté');

  for(var cmd in commands)
  {
    socket.on(cmd, commands[cmd]);
  }

});

// Listeners
commands = {
  'cmd:move' : cmdMove
};

function cmdMove(str) {
  console.log(str);
}


/**************************************/
/************** SERVER ****************/

http.listen(8080, function(){
  console.log('listening on *:8080');
});

/**************************************/
