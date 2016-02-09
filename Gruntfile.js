var LIVERELOAD_PORT = 35100;
var SERVER_PORT = 8700;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

  // Show elapsed time at the end
  require('time-grunt')(grunt);

  // Load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
  require('load-grunt-tasks')(grunt);

  var directoryConfig = {
    app: 'app',
    dist: 'dist'
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    directory: directoryConfig,

    // Clean files and folders from [dist]
    // https://github.com/gruntjs/grunt-contrib-clean
    clean: {
      dist: {
        src: ["<%= directory.dist %>"]
      },
      scripts: {
        src: ["<%= directory.dist %>/js/*.js"]
      },
      styles: {
        src: ["<%= directory.dist %>/css/*.css"]
      }
    },

    // Run predefined tasks whenever watched file patterns are added, changed or deleted.
    // https://github.com/gruntjs/grunt-contrib-watch
    watch: {
      options: {
        spawn: false,
        livereload: true
      },
      styles: {
        files: [
          '<%= directory.app %>/sass/**/*.scss'
        ],
        tasks: [
          'useminPrepare',
          'sass',
          'includereplace',
          'concat',
          'clean:styles',
          'cssmin',
          'copy:styles',
          'filerev:styles',
          'usemin'
        ]
      },
      configFiles: {
        files: [ 'Gruntfile.js'],
        options: {
          reload: true
        }
      },
      scripts: {
        files: [
          '<%= directory.app %>/js/**/*.js'
        ],
        tasks: [
          'useminPrepare',
          'clean:scripts',
          'includereplace',
          'concat',
          'uglify',
          'copy:scripts',
          'filerev:scripts',
          'usemin'
        ]
      },
      html: {
        files: [
          '<%= directory.app %>/html/{,*/}*.html',
          '<%= directory.app %>/html/templates/{,*/}*.html',
          '<%= directory.app %>/html/shared/{,*/}*.html'
        ],
        tasks: [
          'useminPrepare',
          'includereplace',
          'usemin'
        ]
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '<%= directory.dist %>/i/{,*/}*.{png,jpg,jpeg,gif,webp}'
        ],
        tasks: ['build']
      }
    },

    // Compile Sass to CSS
    // https://github.com/gruntjs/grunt-contrib-sass
    sass: {
      dev: {
        src: '<%= directory.app %>/sass/main.scss',
        dest: '<%= directory.app %>/css/main.css',
        options: {
          sourcemap: 'none'
        }
      }
    },

    // Copy files and folders
    // https://github.com/gruntjs/grunt-contrib-copy
    copy: {
      bower: {
        expand: true,
        cwd: '<%= directory.app %>/lib/',
        src: '**',
        dest: '<%= directory.dist %>/lib'
      },
      //bower: {
      //  expand: true,
      //  cwd: '/bower_components/',
      //  src: '**',
      //  dest: '<%= directory.dist %>/lib'
      //},
      scripts: {
        expand: true,
        src: '.tmp/concat/**/*.js',
        dest: '<%= directory.dist %>/js/',
        flatten: true,
        filter: 'isFile'
      },
      styles: {
        expand: true,
        src: '.tmp/concat/**/main.css',
        dest: '<%= directory.dist %>/css/',
        flatten: true,
        filter: 'isFile'
      },
      images: {
        expand: true,
        src: [
          '<%= directory.app %>/i/*.{jpg,jpeg,gif,png,webp,svg}'
        ],
        dest: '<%= directory.dist %>/i/',
        flatten: true,
        filter: 'isFile'
      },
      rootFiles: {
        expand: true,
        src: [
          '<%= directory.app %>/*.*'
        ],
        dest: '<%= directory.dist %>',
        flatten: true,
        filter: 'isFile'
      }
    },

    // Install Bower packages. Smartly.
    // https://github.com/yatskevich/grunt-bower-task
    bower: {
      install: {
        options: {
          targetDir: '<%= directory.app %>/lib',
          cleanBowerDir: true,
          layout: 'byType'
        }
      }
    },

    // Start a connect web server
    // https://github.com/gruntjs/grunt-contrib-connect
    connect: {
      options: {
        port: SERVER_PORT,
        // change this to '0.0.0.0' to access the server from outside
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, directoryConfig.dist)
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, directoryConfig.dist)
            ];
          }
        }
      }
    },

    // Grunt task to include files and replace variables
    // https://github.com/alanshaw/grunt-include-replace
    includereplace: {
      dynamic_mappings: {
        files: [
          {
            expand: true,
            src: [
              '<%= directory.app %>/html/**/*.html',
              '!<%= directory.app %>/html/templates/*.html',
              '!<%= directory.app %>/html/shared/**/*.html'
            ],
            dest: '<%= directory.dist %>',
            flatten: true
          }
        ]
      }
    },

    // Grunt task to replaces references to non-optimized scripts or stylesheets into a set of HTML files (or any templates/views)
    // https://github.com/yeoman/grunt-usemin
    useminPrepare: {
      dist: {
        html: '<%= directory.app %>/html/index.html',
        options: {
          dest: '<%= directory.dist %>'
        }
      }
    },
    usemin: {
      html: ['<%= directory.dist %>/**/*.html'],
      css: ['<%= directory.app %>/css/**/*.css'],
      js: ['<%= directory.app %>/js/**/*.js'],
      options: {
        dirs: ['<%= directory.dist %>']
      }
    },

    // Grunt task to include files and replace variables
    // https://github.com/alanshaw/grunt-include-replace
    cssmin: {
      dist: {
        files: {
          '<%= directory.dist %>/css/main.min.css': [
            '.tmp/concat/css/**/*.css'
          ]
        }
      }
    },

    // Grunt task for file revving
    // https://github.com/yeoman/grunt-filerev
    filerev: {
      options: {
        algorithm: 'md5',
        length: 8
      },
      styles: {
        src: '<%= directory.dist %>/css/**/*.css'
      },
      scripts: {
        src: '<%= directory.dist %>/js/**/*.js'
      }
    },

    // Grunt task to concatenate files
    // https://github.com/gruntjs/grunt-contrib-concat
    concat: {
      generated: {
        files: [
          {
            dest: '.tmp/concat/js/main.js',
            src: [
              '<%= directory.app %>/lib/jquery/jquery.js',
              '<%= directory.app %>/js/main.js'
            ]
          },
          {
            dest: '.tmp/concat/css/main.css',
            src: [
              '<%= directory.app %>/lib/normalize.css/normalize.css',
              '<%= directory.app %>/css/main.css'
            ]
          }
        ]
      }
    },

    // Grunt task to minify files with UglifyJS
    // https://github.com/gruntjs/grunt-contrib-uglify
    uglify: {
      generated: {
        files: [
          {
            dest: '<%= directory.dist %>/js/main.min.js',
            src: [ '.tmp/concat/js/main.js' ]
          }
        ]
      }
    }
  });

  grunt.registerTask('server', function () {
    return grunt.task.run([
      'build',
      'connect:dist:keepalive'
    ]);
  });

  grunt.registerTask('dev', function () {
    return grunt.task.run([
      'build',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('default', function () {
    return grunt.task.run([
      'build'
    ]);
  });

  grunt.registerTask('build', [
    'bower:install',
    'clean:dist',
    'sass',
    'useminPrepare',
    'includereplace',
    'concat',
    'uglify',
    'cssmin',
    'copy',
    'filerev',
    'usemin'
  ]);
};