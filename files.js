var _ = require('lodash');
var files = {
  dist: [
    'build/ct-ui-router-extras.js'
  ],
  min: [
    'build/ct-ui-router-extras.min.js'
  ],
  src: [
    'src/module.js',
    'src/util.js',
    'src/deepStateRedirect.js',
    'src/stickyStateProvider.js',
    'src/stickyState.js',
    'src/futureState.js',
    'src/previousState.js',
    'src/transition.js',
    'src/noop.js'
  ],
  test: [
    'test/temp.js',
    'test/deepStateRedirectSpec.js',
    'test/futureStateSpec.js',
    'test/stickyStateSpec.js',
    'test/previousStateSpec.js',
    'test/transitionSpec.js',
    'src/fsfactories/ngload.js',
    'src/fsfactories/iframe.js',
    'src/noop.js'
  ],
  testUtil: [ 'test/testUtil.js', 'bower_components/lodash/dist/lodash.js'],
  jquery: [  'bower_components/jquery/dist/jquery.js' ],
  angular: [ 'bower_components/angular/angular.js' ],
  angular_mocks: [ 'bower_components/angular-mocks/angular-mocks.js' ],
  ui_router: [ 'bower_components/angular-ui-router/release/angular-ui-router.js' ],
  ui_router_0_2_5: [ 'ui-router-versions/0.2.5/angular-ui-router.js' ],
  ui_router_0_2_7: [ 'ui-router-versions/0.2.7/angular-ui-router.js' ],
  ui_router_0_2_8: [ 'ui-router-versions/0.2.8/angular-ui-router.js' ],
  ui_router_0_2_10: [ 'ui-router-versions/0.2.10/angular-ui-router.js' ],
  ui_router_HEAD: [ 'ui-router-versions/2014-07-05/angular-ui-router.js' ]
};

var devfiles = {
  src: files.src,
  test: files.test,
  testUtil: files.testUtil,
  angular: files.angular,
  angular_mocks: files.angular_mocks,
  ui_router: files.ui_router
};

var buildfiles = {
  src: files.dist,
  test: files.test,
  testUtil: files.testUtil,
  angular: files.angular,
  angular_mocks: files.angular_mocks,
  ui_router: files.ui_router
};

var minfiles = {
  src: files.min,
  test: files.test,
  testUtil: files.testUtil,
  angular: files.angular,
  angular_mocks: files.angular_mocks
};

var min0_2_5files =   _.extend(minfiles, { ui_router: files.ui_router_0_2_5 });
var min0_2_7files =   _.extend(minfiles, { ui_router: files.ui_router_0_2_7 });
var min0_2_8files =   _.extend(minfiles, { ui_router: files.ui_router_0_2_8 });
var min0_2_10files =  _.extend(minfiles, { ui_router: files.ui_router_0_2_10 });
var minHEADfiles =    _.extend(minfiles, { ui_router: files.ui_router_HEAD });

if (exports) {
  exports.files = files;
  exports.devfiles = devfiles;
  exports.buildfiles = buildfiles;
  exports.minfiles = minfiles;
  exports.min0_2_5files = min0_2_5files;
  exports.min0_2_7files = min0_2_7files;
  exports.min0_2_8files = min0_2_8files;
  exports.min0_2_10files = min0_2_10files;
  exports.minHEADfiles = minHEADfiles;
}

