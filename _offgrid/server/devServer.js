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
'use strict';
process.env.PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production')
  require('../lib/mock-require');

var express = require('express');
var path = require('path');
var app = express();
var http = require('http').createServer();
var WebSocketServer = require('./lib/ws').Server,
wss =  new WebSocketServer({ server: http, path: '/wss', perMessageDeflate: false });

var ipc = require('ipc');
ipc.init(wss);

var webpack = require('webpack');
var config = require('../webpack.config.dev');
var app = express();
var compiler = webpack(config);

process.on('uncaughtException', function (err) {
  console.log(err);
  console.log(err.stack);
});


app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));
app.use(require('webpack-hot-middleware')(compiler));

app.use('/static', express.static(path.join(__dirname, "../static")));

// SETUP BLOB APP
process.httpApp = app;
require('./app.js');

app.use('/', express.static(path.join(__dirname, "../public")));

http.on('request', app);

http.listen(process.env.PORT, 'localhost', function(err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('server listening on port: %s', process.env.PORT);
});
