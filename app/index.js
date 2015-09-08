var app  = require('app')
var Menu = require('menu')
var path = require('path')
var http = require('http')
var fs   = require('fs')

var windows    = require('./lib/windows')
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
  .use(require('ssb-patchwork-api'))

config.keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'))
if(config.keys.curve === 'k256')
  throw new Error('k256 curves are no longer supported,'+
                  'please delete' + path.join(config.path, 'secret'))

app.on('ready', function () {
  // start sbot
  var sbot = createSbot(config)

  // write manifest file
  fs.writeFileSync(
    path.join(config.path, 'manifest.json'),
    JSON.stringify(sbot.getManifest(), null, 2)
  )

  // setup blob server
  http.createServer(require('./lib/blobs-http-server')(sbot)).listen(7777)

  // open launcher window
  var mainWindow = windows.open(
    sbot,
    'file://' + path.join(__dirname, '../node_modules/ssb-patchwork-ui/main.html'),
    { width: 1030, height: 720 }
  )
  require('./lib/menu')(mainWindow)
  // mainWindow.openDevTools()
});
