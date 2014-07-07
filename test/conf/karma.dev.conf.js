var allFiles = require('../../files.js');
var standardConf = require("./karma.base.conf");
standardConf.files = standardConf.files.concat(allFiles.files.ui_router_0_2_10).concat(allFiles.files.src);
module.exports = function(config) { config.set(standardConf); };

