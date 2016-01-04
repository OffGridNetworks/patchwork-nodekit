# Patchwork

![screenshot](./screenshot.png)

Patchwork is a decentralized sharing app.
It was built for friends of the SSB project, to test basic functions.
They use it as a test-bed for features, and for their own daily messaging.

### FORK DETAILS 

It is forked by OffGridNetworks as a reference app to run directly under Node.js and NodeKit for web and mobile devices,
in addition to the base Electron version.  Patches include allowing multiple copies to run on the same localhost on seperate
ports (for easier testing), elimination of all NPM packages that require compilation to Node bindings (for mass portability),
removal of Electron API features that cannot be emulated in a browser (e.g., use an aysnchronous image loader instead of the 
synchronous NativeImage API that is included in electron), use of in-memory version of LevelDB instead of the persistent version (for maximum portability), reduced UDP broadcasting on
the local network (favoring pre-defined multi-cast addresses only for those nodes that opt in), and a few development shortcuts like using WebPack for hot reloading of the UI client.

This is not intended for production use but is a proof of concept to demonstrate that SSB can be used in a pure javascript environment
and run on Javascript engines other than Blink/V8.  It works well on a WKWebView / UIWebView / Javascriptcore on iOS and OSX and 
will soon be running under Android and Windows.   Instructions for incorporating in [Nodekit](http://nodekit.io) are available
on request.

Please note that this fork is not intended to create a server version of patchwork that runs in the cloud.  The whole idea
of distributed apps is that they run completely distributed.  We keep a 1-1 relationship between client and server anyway, the 
only reason we reconverted it to run under alternative Node engines is for embedded Node environments where a 40Mb Electron download is prohibitive 
or even undistributable through AppStores (e.g., iOS).   We have tried to keep the original source untouched and operable in this fork
to facilitate keeping in sync with the great work at ssbc/patchwork.

### License

The fork (largely the _offgrid directory and the updated package.json, .gitignore files and portions of README.md) is released under the [Apache 2 license](./LICENSE)

Copyright © 2016 OffGrid Networks

This product includes software developed at
The Secure Scuttlebut Consortium. 

Portions Copyright © 2015-2016 Secure Scuttlebutt Consortium

This product includes software developed by Einar Otto Stangvik
Copyright (c) 2011 Einar Otto Stangvik &lt;einaros@gmail.com&gt;
See [WS](./_offgrid/server/lib/ws/README.md)

## Install (Web / Mobile Version_)

Install node v5.0 (you might like to use [nvm](https://github.com/creationix/nvm)).

```bash
git clone https://github.com/offgridnetworks/patchwork-nodekit.git
cd patchwork-nodekit
npm install --no-optional
npm run build:prod
npm run build:server
```

## Patch 1 line in _offgrid/dist/prodserver.js (for production only, not needed for development)

```js
CHANGE LINE 15
/******/ 			id: moduleId,
TO
/******/ 			id: moduleId, parent: true,
```

## Run

```bash
# from the checkout directory
npm start
# or for hot module-reloading
npm run dev
```

Go to a browser and navigate to [http://localhost:3000](http://localhost:3000)


## Original Install (Electron Version_)

Install node v5 (you might like to use [nvm](https://github.com/creationix/nvm)).

``` bash
npm install ssb-patchwork -g
```

or

```bash
git clone https://github.com/ssbc/patchwork.git
cd patchwork
npm install
npm run build:ui
```

## Run

```bash
# if installed globally
patchwork
```

or

```bash
# from the checkout directory
npm start
```

If it's your first time running patchwork,
follow the on screen instructions to start a new identity
and join a pub server.


## Original Docs

- [Building Patchwork](./docs/BUILDING.md)
- [Creating a Testing Environment, and Running Tests](./docs/TESTING.md)
- [Patchwork Project Structure](./docs/PROJECT-STRUCTURE.md)
- [SSB Docs Repo](https://github.com/ssbc/docs)
