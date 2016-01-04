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
const EventEmitter = require('events').EventEmitter;
const util = require('util')

var _ipc;

function Ipc(){
    EventEmitter.call(this);
 }
 
util.inherits(Ipc, EventEmitter)

Ipc.prototype.init = function init(socket){
  
  var self = this;
  this._socket = socket;
  this.window = {};
  
  socket.on('connection', function(conn) {
    
      self.window.webContents = new WebContents(conn);
     
      conn.on('message', function(data) {
         var msg = JSON.parse(data);
           var e = {type: msg.type, sender: self.window.webContents};
          if (msg.replyid) 
          {
            self.emit(msg.type, e, msg.data);
            if (e.returnValue)
              conn.send(JSON.stringify({type: 'ipc-reply',id: msg.replyid, data: e.returnValue}))
          }
          else
          {
               self.emit(msg.type, e, msg.data);
          }
      });
    
     conn.on('close', function() {});
  });
}


function WebContents(conn){
  this._conn = conn;
}

WebContents.prototype.send = function(eventType, data) {
  this._conn.send(JSON.stringify({type: eventType, data: data}))
}

exports = module.exports = function(){
    if (_ipc)
      return _ipc;
      
    _ipc = new Ipc();
      return _ipc;
}();
