/*!
 * gulp
 * $ npm install gulp-jshint gulp-concat gulp-uglify gulp-notify gulp-rename gulp-wrap karma del --save-dev
 */
//require("time-require");
// Load plugins
var gulp = require('gulp'),
  _ = require('lodash'),
  notify = require('gulp-notify'),
  uirExtrasModules = require('./files'),
  banners = require('./banners.json'),
  pkg = require('./package.json'),
  fs = require('fs'),
  iife = '(function(angular, undefined){\n"use strict";\n<%= contents %>\n})(angular);',
  umdTemplate = fs.readFileSync('./umd.js', 'utf-8');

// Scripts
gulp.task('scripts', ['clean'], function() {
  var jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    wrap = require('gulp-wrap'),
    result = undefined;

  _.each(uirExtrasModules, function(module) {
    var description = module.module == "all" ? "Monolithic build (all modules)" : "Module: " + module.module;
    result = gulp.src(module.src)
      .pipe(jshint.reporter('default'))
      .pipe(concat(module.dist))
      .pipe(wrap(module.module == "all" ? umdTemplate : iife))
      .pipe(wrap(banners.banner.join("\n") + '\n<%= contents %>\n', { pkg: pkg, module: description }))
      .pipe(gulp.dest(module.dest))
      .pipe(rename({ suffix: '.min' }))
      .pipe(uglify())
      .pipe(wrap(banners.minbanner.join("\n") + '\n<%= contents %>\n', { pkg: pkg, module: description }))
      .pipe(gulp.dest(module.dest))
      .pipe(notify({message: 'built ' + module.module}))
    ;

    if (!result) return result;
  });

  return result;
});

// Clean
gulp.task('clean', function(cb) {
  var del = require('del');

  del(['build/**/*'], cb)
});

// Default task
gulp.task('default', ['clean' ], function() {
  "use strict";
  var runSequence = require("run-sequence");
  runSequence("karma:modules", "karma:versions");
});

// used by the various "karma" tasks
function testModule(moduleName, option) {
  var karma = require('karma').server;
  var Q = require('q');
  var dynamicconf = require("./test/conf/karma.dynamic.conf");
  dynamicconf.extrasModule = moduleName;
//  dynamicconf.uiRouter = "0.2.8";

  var d = Q.defer();
  var extraOptions, karmaConfig = { configFile: __dirname + '/test/conf/karma.any.conf.js' };
  switch(option) {
    case "debug":
      extraOptions = { singleRun: false, browsers: ["Chrome"] };
      break;
    case "watch":
      extraOptions = { singleRun: false, browsers: ["PhantomJS"] };
      break;
    default:
      extraOptions = { singleRun: true, browsers: ["PhantomJS"] };
  }

  karma.start(_.extend(karmaConfig, extraOptions), done);

  function done(success) {
    if (success === 0) {
      d.resolve();
    } else {
      d.reject();
    }
  }
  return d.promise;
}

gulp.task('karma:modules', ['scripts'], function() {
  var karma = require('karma').server;
  var Q = require('q');
  var promise = Q(true);
  _.each(uirExtrasModules, function(module) {
    promise = promise.then(_.partial(testModule, module.module));
  });

  return promise;
});

gulp.task('karma:versions', ['scripts'], function() {
  var karma = require('karma').server;
  var Q = require('q');
  var versions = [ '0.2.8', '0.2.10', '0.2.12', '0.2.13' ];
  var dynamicconf = require("./test/conf/karma.dynamic.conf");

  var promise = Q(true);
  _.each(versions, function(version) {
    promise = promise.then(function () {
      dynamicconf.uiRouter = version;
      return testModule("all");
    });
  });

  return promise;
});

gulp.task('karma:watch', ['scripts'], function() {
  return testModule("all.watch", "watch");
});

gulp.task('karma:debug', ['scripts'], function() {
  return testModule("all.watch", "debug");
});

gulp.task('changelog', function() {
  require('conventional-changelog')({
    repository: 'https://github.com/christopherthielen/ui-router-extras',
    version: require('./package.json').version
  }, function(err, log) {
    console.log('Here is your changelog!', log);
  });
});
