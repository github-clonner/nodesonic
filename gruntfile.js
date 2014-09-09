var path = require('path'),
    chalk = require('chalk');

module.exports = function(grunt) {
  var source = ['kernel.js'];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // concat: {
    //   server: {
    //     src: source,
    //     dest: 'build/test.min.js',
    //   }
    // },
    // uglify: {
    //   server: {
    //     src: 'build/test.min.js',
    //     dest: 'build/test.min.js'
    //   }
    // },
    compress: {
      audio: {
        options: {
          mode: 'zip',
          archive: '<%= compress_audio_name %>' + '.zip'
        },
        files: [{ src: '<%= compress_audio_source %>', dest: '<%= compress_audio_name %>', expand: true }]
      }/*,
      nodewebkit: {
        options: {
          mode: 'zip',
          archive: 'archive.zip'
        },
        files: [
          { src: source.concat(['distrib/mac/package.json']), dest: '.' }
        ]
      }*/
    },
    shell: {
      server: {
          command: function () {
              return 'nodemon kernel.js | node_modules/.bin/bunyan ';
          }
      }/*,
      nodewebkit: {
          command: function () {
              return '/Users/einsenhorn/Workspace/nodeWebkit/node-webkit.app/Contents/MacOS/node-webkit archive.nw';
          }
      }*/
    },
    jsdoc : {
      dist : {
        src: ['api/*.js', 'api/*/*.js', 'models/*.js'],
        options: {
          destination: 'doc'
        }
      }
    }
  });

  grunt.config.set('paths', {
    audio: '/audio',
    cache: '/cache'
  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-jsdoc');
  // grunt.loadNpmTasks('grunt-contrib-concat');
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('nodesonic:audio:import', chalk.green('import in database some audio files\n[path] [extensions] [cache] [profile]'), function() {
    require('./grunt/nodesonic/import/audio.js')(grunt, this, __dirname);
  });

  grunt.registerTask('nodesonic:audio:compress', chalk.green('compress file or dir.'), function() {
    var source = grunt.option('source'),
        name = grunt.option('name');

    if (typeof source === 'undefined') {
      grunt.log.error('option `source` is required.');
      return false;
    }

    if (typeof name === 'undefined') {
      grunt.log.error('option `name` is required.');
      return false;
    }

    var fs = require('fs'),
        path = require('path'),
        p, stat;

    p = path.resolve(source);

    stat = fs.statSync(p);
    if (stat.isDirectory()) {
      source = source + '/*';
    }

    grunt.config.set('compress_audio_source', source);
    grunt.config.set('compress_audio_name', name);

    this.requiresConfig('compress_audio_source');
    this.requiresConfig('compress_audio_name');

    grunt.task.run('compress:audio');
  });

  // grunt.registerTask('webkit', 'webkit', ['compress:nodewebkit', 'shell:nodewebkit']);
  grunt.registerTask('default', chalk.green('launch server.'), ['shell:server']);
};
