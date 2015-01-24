// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-06-15 using
// generator-karma 0.8.1

var files = require('../../files.js').files;

var baseConfig = {
  // enable / disable watching file and executing tests whenever any file changes
  autoWatch: true,
  // base path, that will be used to resolve files and exclude
  basePath: '../../',
  // testing framework to use (jasmine/mocha/qunit/...)
  frameworks: ['jasmine'],
  // list of files / patterns to load in the browser
  files: [],
//    .concat(
//      files.jquery,
//      files.angular,
//      files.angular_mocks,
//      files.testUtil,
//      files.test),
  // list of files / patterns to exclude
  exclude: [],
  // web server port
  port: 8080,
  // Start these browsers, currently available:
  // - Chrome
  // - ChromeCanary
  // - Firefox
  // - Opera
  // - Safari (only Mac)
  // - PhantomJS
  // - IE (only Windows)
  browsers: [
    'PhantomJS', 'Chrome'
  ],

  // Which plugins to enable
  plugins: [
    'karma-phantomjs-launcher',
    'karma-chrome-launcher',
    'karma-jasmine'
  ],

  // Continuous Integration mode
  // if true, it capture browsers, run tests and exit
  singleRun: false,
  colors: true

  // level of logging
  // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
//  logLevel: config.LOG_INFO

  // Uncomment the following lines if you are using grunt's server to run the tests
  // proxies: {
  //   '/': 'http://localhost:9000/'
  // },
  // URL root prevent conflicts with the site root
  // urlRoot: '_karma_'
};

module.exports = baseConfig;
