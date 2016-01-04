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

var broadcast = require('./broadcast-stream')

function isFunction (f) {
  return 'function' === typeof f
}

module.exports = {
  name: 'local',
  version: '2.0.0',
  init: function (sbot, config) {

    var local = broadcast(config.port || 8018)

    local.on('data', function (buf) {
      if(buf.loopback) return

      var data = buf.toString()
      sbot.gossip.add(data, 'local')
    })

    setInterval(function () {
      // broadcast self
      // TODO: sign beacons, so that receipient can be confidant
      // that is really your id.
      // (which means they can update their peer table)
      // Oh if this includes your local address,
      // then it becomes unforgeable.
      local.write(sbot.getAddress())
    }, 1000)
  }
}

