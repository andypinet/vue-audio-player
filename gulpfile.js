var config = require("./anuconfig");

var buildFolder = config.globalConfig.buildFolder;
var workFolder = config.globalConfig.workFolder;
var destFolder = config.globalConfig.destFolder;

var gulp = require('gulp-param')(require('gulp'), process.argv);
var rootpath = process.cwd();

// sass
var sassmodule = require(`${buildFolder}/build/sass`);
var localsasscompile = sassmodule.localsasscompile;

localsasscompile({
    taskname: "watch-src-scss",
    gulp: gulp,
    watchpath: `${workFolder}${config.sassConfig.watchpath}`,
    srcpath: `${workFolder}${config.sassConfig.srcpath}`,
    srcfolder: "a",
    destfolder: `${destFolder}${config.sassConfig.destfolder}`,
    postcss: config.sassConfig.postcss,
    debug:config.sassConfig.debug,
    rootpath: rootpath
});
