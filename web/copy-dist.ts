/**
 * Copy files to the dist folder after a build.
 */

import * as fs from "fs-extra";

fs.ensureDirSync("web/dist");
fs.ensureDirSync("web/dist/img");
fs.ensureDirSync("web/dist/audio");
fs.ensureDirSync("web/dist/fonts");
fs.ensureDirSync("web/dist/pages");

fs.copySync("web/img", "web/dist/img");
fs.copySync("web/audio", "web/dist/audio");
fs.copySync("web/fonts", "web/dist/fonts");

fs.copySync("web/index.html", "web/dist/index.html");
fs.copySync("web/index.css", "web/dist/index.css");
fs.copySync("web/index.js", "web/dist/index.js");
fs.copySync("web/play.html", "web/dist/play.html");
fs.copySync("web/play.css", "web/dist/play.css");
fs.copySync("web/pages", "web/dist/pages");

// TODO - Figure out AudioURL config
