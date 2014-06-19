/**
 @toc
 2. load grunt plugins
 3. init
 4. setup variables
 5. grunt.initConfig
 6. register grunt tasks

 */

'use strict';

module.exports = function (grunt) {

  /**
   Load grunt plugins
   @toc 2.
   */
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');


  /**
   Function that wraps everything to allow dynamically setting/changing grunt options and config later by grunt task. This init function is called once immediately (for using the default grunt options, config, and setup) and then may be called again AFTER updating grunt (command line) options.
   @toc 3.
   @method init
   */
  function init(params) {
    /**
     Project configuration.
     @toc 5.
     */
    grunt.initConfig({
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
            ignores: ['**.min.js']
          },
          files: {
            src: []
          }
        },
        //quick version - will not fail entire grunt process if there are lint errors
        beforeconcatQ: {
          options: {
            force: true,
            ignores: ['**.min.js']
          },
          files: {
            src: ['**.js']
          }
        }
      },
      connect: {
        main: {
          options: {
            hostname: '*',
            port: 9003,
            base: [ "." ],
            open: true,
            livereload: true,
          }
        },
        livereload: {
          options: {
            hostname: '*',
            port: 9004,
            base: [ "." ]
          }
        }
      },
      watch: {
        main: {
          options: {
            livereload: true,
            livereloadOnError: false,
            spawn: false
          },
          files: [ './*.html', 'css/**/*.css', 'partials/**/*.html', 'js/**/*.js' ],
          tasks: [ ]
        }
      } 
    });

    /**
     register/define grunt tasks
     @toc 6.
     */
      // Default task(s).
    grunt.registerTask('default', ['jshint','connect:main','watch:main']);
  }

  init({});

};
