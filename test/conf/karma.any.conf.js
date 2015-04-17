var modules = require('../../files.js');
var baseConfig = require("./karma.base.conf.js");
var dynamicConfig = require('./karma.dynamic.conf.js');
var _ = require("lodash");

module.exports = function(_config) {
  var config = _.clone(baseConfig, true);

  config.files.push('bower_components/jquery/dist/jquery.js');
  config.files.push('bower_components/angular/angular.js');
  config.files.push('bower_components/angular-mocks/angular-mocks.js');
  config.files.push('bower_components/lodash/lodash.js');
  config.files.push('test/testUtil.js');
  config.files.push('ui-router-versions/' + dynamicConfig.uiRouter + '/angular-ui-router.js');

  var doesntNeedCoreAdded = [ 'core', 'all' ];
  if (doesntNeedCoreAdded.indexOf(dynamicConfig.extrasModule) === -1)
    config.files.push('src/core.js');

  var watch = dynamicConfig.extrasModule === "all.watch";
  var moduleDef = watch ? modules.all : modules[dynamicConfig.extrasModule];

  if (watch) {
    config.files = config.files.concat(moduleDef.src);
  } else {
    config.files = config.files.concat(moduleDef.dest + "/" + moduleDef.dist);
  }

  config.files = config.files.concat(moduleDef.test);
  console.log("------------------> Karma dynamic config <------------------");
  console.log(dynamicConfig);
  console.log("Testing with these files: ", config.files);

  _config.set(config);
};
