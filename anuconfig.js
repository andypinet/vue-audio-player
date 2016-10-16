exports.globalConfig = {
    buildFolder: "/Users/tongguwei/electronproject/electron-build",
    workFolder: "/Users/tongguwei/frontprojects/my-vux-audio-player/src/assets/",
    destFolder: "/Users/tongguwei/frontprojects/my-vux-audio-player/src/assets/"
};

exports.sassConfig = {
    watchpath: "/sass/**/*.scss",
    srcpath: "/sass/**/*.scss",
    destfolder: "/css/",
    debug: true,
    postcss: {
        assets: {
            relative: 'css',
            basePath: '/Users/tongguwei/frontprojects/my-vux-audio-player/src/assets/',
            loadPaths: ['images/']
        }
    }
};

exports.es6Config = {
    watchpath: "/engineer/js/**/*.js",
    srcpath: "/engineer/js/controller/",
    destfolder: "/js/controller/",
    debug: true
};
