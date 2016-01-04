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
        './_offgrid/client/index.jsx'
    ],
    output: {
        path: path.join(__dirname, 'static'),
        filename: 'bundle.js',
        publicPath: '/'
    },

    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false
            }
        }),
        new StringReplacePlugin()
    ],
    resolve: {
        alias: {
            "ipc": path.join(__dirname, '/lib/ipcRenderer.js'),
            "remote": path.join(__dirname, 'lib/remote.js'),
            "web-frame": path.join(__dirname, 'lib/web-frame.js'),
            "clipboard": path.join(__dirname, 'lib/clipboard.js'),
            "native-image": path.join(__dirname, 'lib/native-image.js')
        },
        extensions: ["", ".js", ".jsx"]
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loaders: ['babel'],
            include: [path.join(__dirname, 'client'),
                path.join(__dirname, '../ui'),
                path.join(__dirname, '../node_modules/patchwork-threads')
            ]
        }, {
            test: /\.css?$/,
            loaders: ['style', 'raw']
        }, {
            test: /\.json$/,
            loaders: ['json-loader']
        }, {
            test: /\.js$/,
            include: [path.join(__dirname, '../node_modules/ip/lib')],
            loader: StringReplacePlugin.replace({
                replacements: [{
                    pattern: /^('use strict';)/i,
                    replacement: function(match, p1, offset, string) {
                        return "";
                    }
                }]
            })
        }, {
            test: /\.jsx?$/,
            include: [path.join(__dirname, '../ui')],
            loader: StringReplacePlugin.replace({
                replacements: [{
                    pattern: /(http:\/\/localhost:7777\/)/i,
                    replacement: function(match, p1, offset, string) {
                        return "/blobs/";
                    }
                }]
            })
        }]
    }
};