// var CONFIG_COMMON = require('./config/config-common');
// var CONFIG_DEV = require('./config/config-dev');

module.exports = function (grunt) {
    var configServer = {
        port: 8384,
        path: "fe-server/build/"
    };

    var config = {
        less: {
            fe: {
                files: {
                    'fe-server/src/styles/styles.css': 'fe-server/src/styles/styles.less'
                }
            },
            desktop: {
                files: {
                    'desktop-app/styles/styles.css': 'desktop-app/styles/styles.less'
                }
            }
        },
        clean: {
            clientBuild: ['fe-server/build']
        },
        htmlmin: {
            task: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyCSS: true
                },
                files: [{
                    expand: true,
                    cwd: 'fe-server/src',
                    src: ['**/*.html'],
                    dest: 'fe-server/build'
                }]
            }
        },
        uglify: {
            fe:{
                options: {
                    sourceMap: true,
                    mangle: false,
                    beautify: true,
                    compress: false
                },
                files: {
                    'fe-server/build/bundle.min.js': [
                        '!fe-server/src/libs/socket.io.js',
                        'fe-server/src/**/*.js'
                    ]
                }
            }
        },
        watch: {
            options: {
                spawn: false
            },
            js: {
                files: 'fe-server/src/**/*.js',
                tasks: ['uglify:dev']
            },
            html: {
                files: 'fe-server/src/**/*.html',
                tasks: ['htmlmin']
            },
            lessFE: {
                files: 'fe-server/src/**/*.less',
                tasks: ['less:compile', 'copy:styles']
            },
            lessBE: {
                files: 'desktop-app/styles/**/*.less',
                tasks: ['less:compile']
            },
        },
        copy: {
            images: {
                files: [{
                    cwd: 'fe-server/src/images',
                    expand: true,
                    src: ['**/*'],
                    dest: 'fe-server/build/images'
                }]
            },
            styles: {
                files: [{
                    cwd: 'fe-server/src/styles',
                    expand: true,
                    src: ['*.css'],
                    dest: 'fe-server/build'
                }]
            }
        },
        browserSync: {
            dev: {
                options: {
                    port: configServer.port,
                    files: ["fe-server/build/*"],
                    watchTask: true,
                    server: {
                        baseDir: configServer.path,
                        directory: true
                    }
                }
            }
        }
    };

    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.registerTask('build', ['clean:clientBuild', 'uglify:fe', 'less:fe', 'less:desktop', 'copy:images', 'copy:styles', 'htmlmin']);
    grunt.registerTask('continious-dev', ['build', 'watch']);
};