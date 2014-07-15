/**
 @toc
 2. load grunt plugins
 3. init
 4. setup variables
 5. grunt.initConfig
 6. register grunt tasks

 */

'use strict';

var _ = require('lodash');
module.exports = function (grunt) {

  /**
   Load grunt plugins
   @toc 2.
   */
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');

  /**
   Function that wraps everything to allow dynamically setting/changing grunt options and config later by grunt task. This init function is called once immediately (for using the default grunt options, config, and setup) and then may be called again AFTER updating grunt (command line) options.
   @toc 3.
   @method init
   */
  function init(params) {
    var files=require('./files').files;
    /**
     Project configuration.
     @toc 5.
     */
    grunt.initConfig({
      concat: {
        options: {},
        dist: {
          src: ['src/_intro.js.txt'].concat(files.src).concat(['src/_outtro.js.txt']),
          dest: 'build/ct-ui-router-extras.js'
        }
      },
      jshint: {
        options: {
          //force:          true,
          globalstrict: true,
          //sub:            true,
          node: true,
          loopfunc: true,
          browser: true,
          devel: true,
          globals: {
            angular: false,
            $: false,
            moment: false,
            Pikaday: false,
            module: false,
            forge: false
          }
        },
        beforeconcat: {
          options: {
            force: false,
            ignores: ['**.min.js'],
            strict: false
          },
          files: {
            src: []
          }
        },
        //quick version - will not fail entire grunt process if there are lint errors
        beforeconcatQ: {
          options: {
            force: true,
            strict: false,
            ignores: ['**.min.js']
          },
          files: {
            src: ['src/**/*.js']
          }
        }
      },
      uglify: {
        options: {
          mangle: false
        },
        build: {
          files: {},
          src: 'build/ct-ui-router-extras.js',
          dest: 'build/ct-ui-router-extras.min.js'
        }
      },
      karma: {
        options: {
          configFile: 'test/conf/karma.conf.js',
          singleRun: true,
          exclude: [],
          frameworks: ['jasmine'],
          reporters: 'dots', // 'dots' || 'progress'
          port: 8080,
          colors: true,
          autoWatch: false,
          autoWatchInterval: 0,
          browsers: [ grunt.option('browser') || 'PhantomJS' ]
        },
        unit: {
          configFile: 'test/conf/karma.dev.conf.js',
          singleRun: true,
          browsers: [ grunt.option('browser') || 'PhantomJS' ]
        },
        min: {
          configFile: 'test/conf/karma.min.conf.js',
          singleRun: true,
          browsers: [ grunt.option('browser') || 'PhantomJS' ]
        },
        uirouter0_2_5: {
          configFile: 'test/conf/karma.0_2_5.conf.js',
          singleRun: true,
          browsers: [ grunt.option('browser') || 'PhantomJS' ]
        },
        uirouter0_2_6: {
          configFile: 'test/conf/karma.0_2_6.conf.js',
          singleRun: true,
          browsers: [ grunt.option('browser') || 'PhantomJS' ]
        },
        uirouter0_2_7: {
          configFile: 'test/conf/karma.0_2_7.conf.js',
          singleRun: true,
          browsers: [ grunt.option('browser') || 'PhantomJS' ]
        },
        uirouter0_2_8: {
          configFile: 'test/conf/karma.0_2_8.conf.js',
          singleRun: true,
          browsers: [ grunt.option('browser') || 'PhantomJS' ]
        },
        uirouter0_2_10: {
          configFile: 'test/conf/karma.0_2_10.conf.js',
          singleRun: true,
          browsers: [ grunt.option('browser') || 'PhantomJS' ]
        },
        HEAD: {
          configFile: 'test/conf/karma.HEAD.conf.js',
          singleRun: true,
          browsers: [ grunt.option('browser') || 'PhantomJS' ]
        },
        watch: {
          configFile: 'test/conf/karma.dev.conf.js',
          browsers: [ grunt.option('browser') || 'PhantomJS' ],
          singleRun: false,
          autoWatch: true,
          autoWatchInterval: 1
        },
        debug: {
          configFile: 'test/conf/karma.dev.conf.js',
          singleRun: false,
          background: false,
          browsers: [ grunt.option('browser') || 'Chrome' ]
        }
      }
    });


    /**
     register/define grunt tasks
     @toc 6.
     */
      // Default task(s).
    grunt.registerTask('default', ['jshint:beforeconcatQ', 'concat', 'uglify:build', 
      'karma:uirouter0_2_5', 'karma:uirouter0_2_6', 'karma:uirouter0_2_7', 'karma:uirouter0_2_8', 'karma:uirouter0_2_10', 'karma:HEAD'
    ]);
    grunt.registerTask('test', ['jshint:beforeconcatQ', 'concat', 'karma:unit']);
    grunt.registerTask('test:watch', ['jshint:beforeconcatQ', 'karma:watch']);

  }

  init({});		//initialize here for defaults (init may be called again later within a task)

};
