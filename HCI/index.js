var PORT = 50000;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var lastCoords = [];

server.on('listening', function() {
  var address = server.address();
 console.log('UDP Server listening on ' + address.address + ':' + address.port);
});

server.on('message', function(message, remote) {
    const msg = message.toString();
    const xyCoords = parseMessage(msg);
    sendItBack(xyCoords);
});

server.bind(PORT, HOST);

function parseMessage(msg){
    let xyCoords = msg.substring(2, msg.length);
    xyCoords = (xyCoords.trim()).split(",");
    return xyCoords;
}

function sendItBack(xyCoords) {
    if (JSON.stringify(lastCoords) == JSON.stringify(xyCoords)) return
    var message = new Buffer("F: " + xyCoords[0] * -1 + ", " + (xyCoords[1] * -1));
    server.send(message, 0, message.length, "8888", HOST, function(err, bytes) {
        if (err) throw err;
        console.log('UDP message ' +  message.toString() + ' sent to ' + HOST +':'+ PORT);
      });
    lastCoords = xyCoords;
}