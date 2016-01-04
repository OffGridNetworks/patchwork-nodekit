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

//var app  = require('app')
//var Menu = require('menu')
var httpApp = process.httpApp;
var path = require('path')
//var http = require('http')
var fs   = require('fs')
var setupRpc = require('../../app/muxrpc-ipc');
var ipc = require('ipc');

//var httpStack  = require('./http-server')
//var windows    = require('./windows')
var config     = require('ssb-config/inject')(process.env.ssb_appname)
var ssbKeys    = require('ssb-keys')
var createSbot = require('scuttlebot')
  .use(require('scuttlebot/plugins/master'))
  .use(require('scuttlebot/plugins/gossip'))
  .use(require('scuttlebot/plugins/friends'))
  .use(require('scuttlebot/plugins/replicate'))
  .use(require('scuttlebot/plugins/blobs'))
  .use(require('scuttlebot/plugins/invite'))
  .use(require('scuttlebot/plugins/block'))
  .use(require('scuttlebot/plugins/logging'))
  .use(require('scuttlebot/plugins/private'))
  .use(require('./lib/local'))
  .use(require('../../api'))
 // .use(require('scuttlebot/plugins/local'))
 // .use(require('../api'))

//config.keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'))
config.keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'+ process.env.PORT))
//if(config.keys.curve === 'k256')
//  throw new Error('k256 curves are no longer supported,'+
//                  'please delete' + path.join(config.path, 'secret'))

//app.on('ready', function () {
  // start sbot
  var rebuild = false
  delete config.port;
  var sbot = createSbot(config)
  setupRpc(ipc.window, sbot)

  // write manifest file
  fs.writeFileSync(
    path.join(config.path, 'manifest.json'),
    JSON.stringify(sbot.getManifest(), null, 2)
  )

  // setup blob serving
  //http.createServer(httpStack.BlobStack(sbot)).listen(7777)
   var httpStack  = require('./http-server')
  httpApp.use('/blobs', httpStack.BlobStack(sbot))
  
  // open main window
 // var mainWindow = windows.open(
 //   'file://' + path.join(__dirname, '../ui/main.html'),
 //   sbot,
 //   { width: 1030, height: 720 }
 // )
 // require('./menu')(mainWindow)
  // mainWindow.openDevTools()

  // setup menu
  // Menu.setApplicationMenu(Menu.buildFromTemplate([{
  //   label: 'Window',
  //   submenu: [
  //     // { label: 'Open Web App', click: onopen },
  //     { label: 'Quit', click: onquit }
  //   ]
  // }]))

//});


