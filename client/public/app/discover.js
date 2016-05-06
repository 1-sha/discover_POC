var sio = io.connect('http://localhost:8080');

sio.on('update:connect', function(msg) {
    console.log(msg);
});