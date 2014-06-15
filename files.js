UREFiles = {
  src: [
    'src/stickyState.js',
    'src/util.js',
    'src/stickyStateProvider.js'
  ],
  test: [ 'test/*Spec.js' ],
  testUtil: [ 'test/testUtil.js'],
  angular: [ 'bower_components/angular/angular.js' ],
  angular_mocks: [ 'bower_components/angular-mocks/angular-mocks.js' ],
  ui_router: [ 'bower_components/angular-ui-router/release/angular-ui-router.js' ]
};

if (exports) {
  exports.files = UREFiles;
}
