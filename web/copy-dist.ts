/**
 * Copy files to the dist folder after a build.
 */

import * as fs from 'fs-extra';

fs.ensureDirSync('web/dist');
fs.ensureDirSync('web/dist/img');
fs.ensureDirSync('web/dist/audio');
fs.ensureDirSync('web/dist/fonts');

const filterPng = (src:string, dst:string):boolean => {
    return (src === 'web/img' || src.endsWith('.png'));
};

fs.copySync('web/img', 'web/dist/img', { filter: filterPng });
fs.copySync('web/audio', 'web/dist/audio');
fs.copySync('web/fonts', 'web/dist/fonts');

fs.copySync('web/index.html', 'web/dist/index.html');
fs.copySync('web/index.css', 'web/dist/index.css');
fs.copySync('web/play.html', 'web/dist/play.html');
fs.copySync('web/play.css', 'web/dist/play.css');

// TODO - Figure out AudioURL config
