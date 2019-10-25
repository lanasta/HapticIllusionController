var PORT = 40000;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var udp = require('udp-packet');

server.on('listening', function() {
  var address = server.address();
 console.log('UDP Server listening on ' + address.address + ':' + address.port);
});

server.on('message', function(message, remote) {
    console.log(remote)
 console.log(udp.decode(message))
 //console.log(remote.address + ':' + remote.port +' - ' + message);
 //console.log(message);

});

server.bind(PORT, HOST);

function parseMessage(msg){
    console.log(msg);
    const xyCoords = msg.substring(2, msg.length);
    console.log(xyCoords)
}