const _               = require('lodash');
const glob            = require('glob');
const path            = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
var exports           = [];

// Define common for all modules
const common  = {
    module: {
        rules: [
            {test: /\.js$/,  exclude: [/node_modules/, /assets/, /vendor/],  use: ["babel-loader"]}
        ],
    },
    resolve: {
        alias: {
            '@installer': path.resolve(__dirname, 'app/installer'),
            '@system': path.resolve(__dirname, 'app/system')
        }
    },
    externals: {"vue": "Vue", "uikit": "UIkit", "uikit-util": "UIkit.util"}
};

// Define process mode and paths to ignore when processed
const mode    = process.env.NODE_ENV = (process.argv.indexOf('-p') !== -1) ? 'production' : 'development';
const ignore  = [
    'packages/**/node_modules/**',
    'packages/**/app/assets/**',
    'packages/**/app/vendor/**'
    // example - '**/pagekit/blog/**'
];

// Process
glob.sync('{app/modules/**,app/installer/**,app/system/**,packages/**}/webpack.config.js', {ignore: ignore}).forEach((file) => {
    let dir = path.join(__dirname, path.dirname(file));
    let pkg = path.join(path.basename(path.dirname(dir)), path.basename(dir));

    exports = exports.concat(require('./' + file).map((config) => {
        config = _.merge({mode: mode, context: dir, output: {path: dir}, externals: common.externals, resolve: common.resolve}, config);
        return build(config);
    }));

});

// Build each webpack.config.js
function build(config) {
    let rules   = _.get(config, 'module.rules') || [],
        loaders = (loader) => rules && rules.filter((e) => e.use === loader || e.use.indexOf(loader) !== -1).length;

    // Merge rules, add common rules to first
    _.set(config, 'module.rules', _.concat([], common.module.rules, rules));

    // Push VueLoader plugin
    if (loaders('vue-loader')) {
        config.plugins = (typeof config.plugins !== 'undefined') ? config.plugins : [];
        config.plugins.push(new VueLoaderPlugin());
    }

    return config;
}

module.exports = exports;