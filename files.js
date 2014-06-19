UREFiles = {
  src: [
    'src/module.js',
    'src/deepStateRedirect.js',
    'src/stickyStateProvider.js',
    'src/stickyState.js',
    'src/futureState.js',
    'src/util.js',
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

if (exports) {
  exports.files = UREFiles;
}

