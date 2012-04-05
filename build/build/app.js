/*
 *  Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var childProcess = require('child_process'),
    fs = require('fs'),
    path = require('path'),
    utils = require('./utils'),
    _c = require('./conf');

function create(path) {
    return function (prev, baton) {
        var cmd = 'mkdir ' + _c.DEPLOY + path;
        childProcess.exec(cmd, baton.pass);
    };
}

function copy(from, to) {
    return function (prev, baton) {
        var cmd = 'cp -r ' + from + ' ' + _c.DEPLOY + to;
        childProcess.exec(cmd, baton.pass);
    };
}

function write(src) {
    return function () {
        var css = _c.ASSETS + "ripple.css",
            cssDeploy = _c.DEPLOY + "app/www/ripple.css",
            index = _c.DEPLOY + "app/www/index.html",
            js = _c.DEPLOY + "app/www/ripple.js",
            doc = src.html.replace(/#URL_PREFIX#/g, "")
                          .replace(/#OVERLAY_VIEWS#/g, src.overlays)
                          .replace(/#DIALOG_VIEWS#/g, src.dialogs)
                          .replace(/#PANEL_VIEWS#/g, src.panels);

        fs.writeFileSync(cssDeploy, fs.readFileSync(css, "utf-8") + src.skins);
        fs.writeFileSync(index, doc);
        fs.writeFileSync(js, src.js +
            "require('ripple/ui').register('omnibar');" +
            "require('ripple/bootstrap').bootstrap();");
    };
}

module.exports = function (src, baton) {
    var jWorkflow = require("jWorkflow");
    baton.take();

    jWorkflow.order(create('app'))
             .andThen(create('app/www'))
             .andThen(copy(_c.EXT + "app", ""))
             .andThen(copy(_c.ASSETS, "app/www"))
             .andThen(write(src))
             .andThen(copy(_c.PACKAGE_JSON, "app/www"))
             .start(baton.pass);
};