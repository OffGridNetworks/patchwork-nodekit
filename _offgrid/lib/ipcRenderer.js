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
var callbacks = {};
var counter = 0;
var _ipc;

exports = module.exports = function(){
    if (_ipc)
      return _ipc;
      
    _ipc = new Ipc();
      return _ipc;
}();

function Ipc(){
 }

Ipc.prototype.init = function init(socket, cb){
     this.events = {};
      
    this._socket = socket;
    this.window = {};
    var self = this;
    socket.onopen    = function()  {
      console.log('new socket connection');
      self.window.webContents = new WebContents(socket);
      cb();
    }
    
    socket.onmessage = function(e) {
        var msg = JSON.parse(e.data);
        
        if (msg.type === 'ipc-reply'){
          var id = msg.id;
          callbacks[id].call(self, msg.data);
          delete callbacks[id];
        } else
        {
          self.emit(msg.type, msg.data);
        }
    };
    
    socket.onclose   = function()  {
        console.log('socket closed'); 
        };
    
    return this;
 }

Ipc.prototype.send = function (eventType, data) {
  this._socket.send(JSON.stringify({type: eventType, data: data}))
}

Ipc.prototype.sendSync = function (eventType, data) {
   throw("sync not implemented use .sendAsync");
}

Ipc.prototype.sendAsync = function (eventType, data, callback) {
    if (typeof data === 'function')
      {
          callback = data;
          data = null;
      }
  var id = "i" + counter++;
  callbacks[id] = callback;
   this._socket.send(JSON.stringify({replyid: id, type: eventType, data: data}));
  
  // TO DO: expire callback table entry in case of non response
}


Ipc.prototype.close = function () {
  this._socket.close()
}


function WebContents(conn){
  this._conn = conn;
}

WebContents.send = function(eventType, data) {
  this._conn.write(JSON.stringify({type: eventType, data: data}))
}


//EVENTEMITTER


/* Polyfill indexOf. */
var indexOf;

if (typeof Array.prototype.indexOf === 'function') {
    indexOf = function (haystack, needle) {
        return haystack.indexOf(needle);
    };
} else {
    indexOf = function (haystack, needle) {
        var i = 0, length = haystack.length, idx = -1, found = false;

        while (i < length && !found) {
            if (haystack[i] === needle) {
                idx = i;
                found = true;
            }

            i++;
        }

        return idx;
    };
};


Ipc.prototype.on = function (event, listener) {
    if (typeof this.events[event] !== 'object') {
        this.events[event] = [];
    }

    this.events[event].push(listener);
};

Ipc.prototype.removeListener = function (event, listener) {
    var idx;

    if (typeof this.events[event] === 'object') {
        idx = indexOf(this.events[event], listener);

        if (idx > -1) {
            this.events[event].splice(idx, 1);
        }
    }
};

Ipc.prototype.emit = function (event) {
    var i, listeners, length, args = [].slice.call(arguments, 1);

    if (typeof this.events[event] === 'object') {
        listeners = this.events[event].slice();
        length = listeners.length;

        for (i = 0; i < length; i++) {
            listeners[i].apply(this, args);
        }
    }
};

Ipc.prototype.once = function (event, listener) {
    this.on(event, function g () {
        this.removeListener(event, g);
        listener.apply(this, arguments);
    });
};