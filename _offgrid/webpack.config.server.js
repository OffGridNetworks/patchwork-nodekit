/*
 * Copyright (c) 2016 OffGrid Networks
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
var path = require('path');
var webpack = require('webpack');
var StringReplacePlugin = require("string-replace-webpack-plugin");

module.exports = {
    devtool: 'source-map',
    entry: [
        './_offgrid/server/server.js'
    ],

    target: "node",
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'prodserver.js',
        publicPath: '/'
    },
    node: {
        __filename: false,
        __dirname: false
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new StringReplacePlugin()
    ],
    resolve: {
        alias: {
            "ipc": path.join(__dirname, 'lib/ipcMain.js'),
            "native-image": path.join(__dirname, 'lib/native-image.js'),
            "chloride": path.join(__dirname, 'lib/chloride.js'),
            "level": 'level-mem'
        },
        extensions: ["", ".js"]
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loaders: ['babel'],
            include: [path.join(__dirname, 'server'),
                path.join(__dirname, '../api')
            ]
        }, {
            test: /\.json$/,
            loaders: ['json-loader']
        }, {
            test: /index\.js$/,
            include: [path.join(__dirname, '../node_modules/ssb-config/node_modules/rc')],
            loader: StringReplacePlugin.replace({
                replacements: [{
                    pattern: /^(#.*)/i,
                    replacement: function(match, p1, offset, string) {
                        return "";
                    }
                }]
            })
        }]
    }
};