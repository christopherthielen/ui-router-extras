var allFiles = require('../../files.js');
var baseConfig = require("./karma.base.conf.js");
var _ = require("lodash");

var fullConfig = _.clone(baseConfig, true);
fullConfig.files = fullConfig.files.concat(allFiles.files.ui_router_0_2_11).concat(allFiles.minfiles.src);
module.exports = function(config) { config.set(fullConfig); };
