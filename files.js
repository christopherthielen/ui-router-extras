var files = {
  dist: [
    'release/ct-ui-router-extras.js'
  ],
  min: [
      'release/ct-ui-router-extras.min.js'
  ],
  src: [
    'src/module.js',
    'src/util.js',
    'src/deepStateRedirect.js',
    'src/stickyStateProvider.js',
    'src/stickyState.js',
    'src/futureState.js',
    'src/previousState.js',
    'src/fsfactories/ngload.js',
    'src/fsfactories/iframe.js'
  ],
  test: [
    'test/deepStateRedirectSpec.js',
    'test/futureStateSpec.js',
    'test/stickyStateSpec.js'
  ],
  testUtil: [ 'test/testUtil.js', 'bower_components/lodash/dist/lodash.js'],
  angular: [ 'bower_components/angular/angular.js' ],
  angular_mocks: [ 'bower_components/angular-mocks/angular-mocks.js' ],
  ui_router: [ 'bower_components/angular-ui-router/release/angular-ui-router.js' ]
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
  angular_mocks: files.angular_mocks,
  ui_router: files.ui_router
};

if (exports) {
  exports.files = files;
  exports.devfiles = devfiles;
  exports.buildfiles = buildfiles;
  exports.minfiles = minfiles;
}

