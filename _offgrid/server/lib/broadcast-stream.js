/*
 * Copyright (c) 2016 OffGrid Networks
 * Portions Copyright (c) 2015-2016 Secure Scuttlebutt Consortium
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var udp = require('dgram')
var pipe = require('stream').prototype.pipe
var os = require('os')

module.exports = function (port, loopback) {

  var addresses = {}
//  var socket = udp.createSocket('udp4')
  var socket = udp.createSocket({type: 'udp4', reuseAddr: true});

  socket.readable = socket.writable = true

  socket.write = function (message) {
    if('string' === typeof message)
      message = new Buffer(message, 'utf8')
    socket.send(message, 0, message.length, port, '255.255.255.255')
    return true
  }

  socket.end = function () {
    socket.close()
  }

  socket.on('close', function () {
    socket.emit('end')
  })

  var latest = null

  socket.on('message', function (msg, other) {
    if(addresses[other.address] && other.port === port) {
      if(loopback === false) return
      msg.loopback = true
    }

    msg.port = other.port
    msg.address = other.address

    //if paused, remember the latest item.
    //otherwise just drop those messages.
    if(socket.paused)
      return latest = msg

    latest = null
    socket.emit('data', msg)
  })

  socket.pause = function () {
    socket.paused = true
    return this
  }

  socket.resume = function () {
    socket.paused = false
    if(latest) {
      var msg = latest
      latest = null
      socket.emit('data', msg)
    }
    return this
  }

//  socket.bind(port)
 socket.bind({
  port: port,
  exclusive: false
});
  socket.on('listening', function () {
    var ifaces = os.networkInterfaces()
    for(var k in ifaces)
      ifaces[k].forEach(function (address) {
        addresses[address.address] = true
      })
    socket.setBroadcast(true)
  })

  socket.pipe = pipe

  return socket
}
