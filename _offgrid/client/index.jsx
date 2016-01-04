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

const host = window.document.location.host.replace(/:.*/, '');
const port = window.document.location.port;
import '../../ui/css/fontawesome.min.css';
import '../../ui/css//main.css';
import React from 'react';
import ReactDOM from 'react-dom';
import pull from 'pull-stream';
var ipc = require('ipc');
// setup basic error-handling, in case app fails to load

//polyfills
window.ReactDOM = ReactDOM;
window.pull = pull;
require('set-tojson').shim();

window.loadErrorHandler = function (e) {
    
  if (e.error)
    e = e.error;
    
  console.error(e)

  // render heading
  var h1 = document.createElement('h1')
  h1.innerText = 'We\'re sorry! OffGrid experienced an error while loading.'
  h1.style.margin = '10px'
  document.body.appendChild(h1)

  // render stack
  var pre = document.createElement('pre')
  pre.style.margin = '10px'
  pre.style.padding = '10px'
  pre.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
  pre.innerText = e.stack || e.toString()
  document.body.appendChild(pre)
}
window.addEventListener('error', window.loadErrorHandler)

// Init IPC
// ====

window.socket = new WebSocket('ws://' + host + ':' + port + '/wss');
window.socket.onopen    = function()  {
      console.log('new socket connection on port ' + port);
    }
window.socket.onclose    = function()  {
      console.log('socket connection closed on port ' + port);
    }
var socketIPC = ipc.init(window.socket, function(){
  
  window.ipc= socketIPC;

    require('../../ui/lib/muxrpc-ipc').init(function(){ 
        // master state object
        window.app = require('../../ui/lib/app')
        // render
        window.app.fetchLatestState(function () {
        ReactDOM.render(require('../../ui/routes.jsx'), document.getElementById('react'))
        window.removeEventListener('error', window.loadErrorHandler)
        })
    });
});
