let PORT = 40000;
let HOST = '127.0.0.1';

const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
let dgram = require('dgram');
const server = dgram.createSocket('udp4');
let lastCoords = [];
let frictionValue = 1;
let boundariesArray = [-1, 1, -1, 1]; //xmin, xmax, ymin, ymax
let taperBoundaries = true;

app.post('/api/setBoundaries', async (req, res) => {
    res.json({requestBody: req.body});
    var reqBody = req.body;
    boundariesArray = reqBody.map(Number);
})

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
    xyCoords[0] = Number(xyCoords[0]);
    xyCoords[1] = 0 - xyCoords[1]; //for some reason the compliance driver code returns y with a flipped sign
    if (JSON.stringify(xyCoords) != JSON.stringify(lastCoords)) {
        sendHapticFeedback(xyCoords);
    }
});

server.bind(PORT, HOST);

function parseMessage(msg){
    let xyCoords = msg.substring(2, msg.length);
    xyCoords = (xyCoords.trim()).split(",");
    return xyCoords;
}

function sendHapticFeedback(xyCoords) {
    if (JSON.stringify(lastCoords) == JSON.stringify(xyCoords)) return;
   console.log("F: " + xyCoords[0]/frictionValue + ", " + xyCoords[1]/frictionValue);
    xyCoords = checkBoundaries(xyCoords);
    xyCoords[0] = parseFloat(xyCoords[0]);
    xyCoords[1] = 0 - xyCoords[1];
    var message = new Buffer("F: " + xyCoords[0]/frictionValue + ", " + xyCoords[1]/frictionValue);
    server.send(message, 0, message.length, "8888", HOST, function(err, bytes) {
        if (err) throw err;
            console.log('UDP message ' +  message.toString() + ' sent to ' + HOST +':'+ PORT);
    });
    lastCoords = xyCoords;
}

function checkBoundaries(xyCoords) {
    let x = parseFloat(xyCoords[0]);
    let y = parseFloat(xyCoords[1]);
    if (x < boundariesArray[0]) {
        xyCoords[0] = boundariesArray[0];
    }
    if (x > boundariesArray[1]) {
        xyCoords[0] = boundariesArray[1];
    }
    if (y < boundariesArray[2]) {
        xyCoords[1] = boundariesArray[2];
    }
    if (y > boundariesArray[3]) {
        xyCoords[1] = boundariesArray[3];
    }
    
    if (taperBoundaries && x != 0) {
        let quad1And3Func = parseFloat(-1/(10*x));
        let quad2And4Func = parseFloat(1/(10*x));
        if (x < 0 && y > 0 ) {
            if (y > quad1And3Func ) {
                xyCoords[1] = quad1And3Func;
            }
        }
        if ( x > 0 && y < 0) {
            if (y < quad1And3Func) {
                xyCoords[1] = quad1And3Func;
            }
        }
        if (x > 0 && y > 0) {
            if (y > quad2And4Func) {
                xyCoords[1] = quad2And4Func;
            }
        }
        if (x < 0 && y < 0) {
            if (y < quad2And4Func) {
                xyCoords[1] = quad2And4Func;
            }
        }
    }
    return xyCoords;
}

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/css/style.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/css/style.css'));
});

app.get('/css/jquery-ui.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/css/jquery-ui.css'));
});

app.get('/js/jquery-ui.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/js/jquery-ui.js'));
});

app.get('/js/jquery-1.12.4.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/js/jquery-1.12.4.js'));
});

app.listen(3000, console.log('Listening on port 3000...'));
