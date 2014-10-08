module.exports = function(grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');



    grunt.initConfig({
        less: {
          dist: {
            files: {
              'assets/css/styles.css': [
                'assets/less/styles.less'
              ]
            },
            options: {
              compress: false,
              sourceMap: true,
              sourceMapFilename: 'styles.css.map',
              sourceMapRootpath: ''
            }
          }
        },
        watch: {
            css: {
                files: ['assets/less/**/*.less'],
                tasks: ['less'],
                options: {
                  livereload: true,
                },
            }
        }
    });

    grunt.registerTask('default', ['less', 'watch:css']);
};

