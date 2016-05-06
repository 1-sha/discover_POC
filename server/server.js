/* Require et dépendences */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var nunjucks = require('nunjucks');

/* Globales et config*/
var client_path = path.resolve(__dirname, '../client'); //adresse du dossier client
var lobbies = [{id: 'ABCD'},{id: 'EFGH'},{id: 'IJKL'}]; //données test

//configuration du moteur de template
nunjucks.configure(['views',client_path],{
	autoescape : true,
	express : app,
  noCache  : true   //pour le développement. Force la recompilation du template à chaque apelle
});

/* Routing */
app.use(express.static(client_path + '/public')); //
app.get('/', ctrlIndex);

/* Controller */
//Renvoie la page d'accueil
function ctrlIndex(req, res) {
  res.render('index.html',{
    lobbies: lobbies,
    page: {url: req.protocol + '://' + req.get('host') + req.originalUrl}
  });
}

/* Socket.io listeners */
io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('update:connect','connecté');
});

//Démarrage du server
http.listen(8080, function(){
  console.log('listening on *:8080');
});
