var udp = require('../')
var test = require('tape')

test('verify an encoded packets checksum, matches a real one', function (t) {
  var packet = udp.encode({
    sourceIp: '100.96.0.21',
    sourcePort: 52133,
    destinationIp: '1.1.1.1',
    destinationPort: 1111,
    data: Buffer.from('hello world')
  })
  const checksum = packet.readUInt16BE(6)
  t.equal(checksum, 0x3786)
  t.end()
})
