var _ = require('lodash');

// List of independent ui-router-extras modules
var moduleNames = [ 'core', 'dsr', 'sticky', 'future', 'previous', 'transition', 'statevis' ];

// convert them to module definitions, by convention
var modules = _(moduleNames)
  .map(function(module) {
    return {
      module: module,
      src : [ "src/" + module + ".js" ],
      test: [ "test/" + module + "Spec.js" ],
      dist: 'ct-ui-router-extras.' + module + '.js',
      min: 'ct-ui-router-extras.' + module + '.min.js',
      dest: 'build/modular'
    };
  })
  .indexBy('module').value();

// sticky states has two src files
modules.sticky.src = ['src/stickyProvider.js'].concat(modules.sticky.src);
modules.core.src.push('src/util.js');

modules.future.test.push('src/fsfactories/ngload.js');
modules.future.test.push('src/fsfactories/iframe.js');

// Build the monolithic module 'all' which sucks in all the others
modules.all = {
  module: 'all',
  src: _.pluck(modules, 'src')
    .reduce(function(memo, ary) { return memo.concat(ary); }, [])
    .concat('src/all.js'),
  test: _.pluck(modules, 'test')
    .reduce(function(memo, ary) { return memo.concat(ary); }, []),
  dist: 'ct-ui-router-extras.js',
  min: 'ct-ui-router-extras.min.js',
  dest: 'build'
};

modules.statevis.test.push('build/modular/ct-ui-router-extras.sticky.js');
modules.previous.test.push('build/modular/ct-ui-router-extras.transition.js');


var otherFiles = {
  testUtil: [ 'test/testUtil.js', 'bower_components/lodash/dist/lodash.js'],
  jquery: [  'bower_components/jquery/dist/jquery.js' ],
  angular: [ 'bower_components/angular/angular.js' ],
  angular_mocks: [ 'bower_components/angular-mocks/angular-mocks.js' ]
};

_.each(modules, function (module) {
  // add other required files to module definition
  _.extend(module, otherFiles);
});

module.exports = modules;
