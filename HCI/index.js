let PORT = 40000;
let HOST = '127.0.0.1';

const express = require('express');
const path = require('path');
const app = express();
var dgram = require('dgram');
const server = dgram.createSocket('udp4');
let lastCoords = [];
let frictionValue = 1;


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/api/setFriction/:frictionValue', async (req, res) => {
    frictionValue = req.params.frictionValue;
})

app.get('/api/currentPosition', async (req, res) => {
    res.json(lastCoords);
})

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
    if (JSON.stringify(lastCoords) == JSON.stringify(xyCoords)) return;
    console.log("F: " + xyCoords[0]/frictionValue + ", " + xyCoords[1]/frictionValue);
    var message = new Buffer("F: " + xyCoords[0]/frictionValue + ", " + xyCoords[1]/frictionValue);
    server.send(message, 0, message.length, "8888", HOST, function(err, bytes) {
        if (err) throw err;
        console.log('UDP message ' +  message.toString() + ' sent to ' + HOST +':'+ PORT);
        });
    lastCoords = xyCoords;
}

app.listen(3000, console.log('Listening on port 3000...'));
