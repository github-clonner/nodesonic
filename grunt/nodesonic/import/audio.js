/*jshint node:true */
'use strict';

var path = require('path'),
    Sequelize = require('sequelize');

module.exports = function(grunt, task, root) {
  var configPath = root + '/config/config.json',
      done = task.async();

  var Watcher = require(root + '/api/watcher/Watcher.js'),
      ffmpeg = require('fluent-ffmpeg'),
      config = require(configPath);

  var pathAudio = grunt.option('path'),
      extensions = grunt.option('extensions'),
      cache = grunt.option('cache') !== false,
      profilename = grunt.option('profile'),
      profile, pathCache,
      watcher, options = {};

  var defaultExtensions = typeof extensions === 'undefined',
      defaultAudio = typeof pathAudio === 'undefined',
      defaultProfile = typeof profilename === 'undefined';

  if (defaultAudio) {
    task.requiresConfig('paths.audio');
    pathAudio = root + grunt.config('paths.audio');
  }
  pathAudio = path.resolve(pathAudio);

  if (defaultExtensions) {
    extensions = '.flac;.mp3;.m4a';
  }
  extensions = extensions.split(';');

  if (defaultProfile) {
    profilename = 'development';
  }

  grunt.log.writeln('import audio from `%s` (default: %s).', pathAudio, defaultAudio);
  grunt.log.writeln('extensions `%s` (default: %s).', extensions.join(' '), defaultExtensions);
  if (cache) {
    task.requiresConfig('paths.cache');
    pathCache = path.resolve(root + grunt.config.get('paths.cache') + '/audio.json');
    grunt.log.writeln('cache enable (`%s`).', pathCache);
    options.cache = pathCache;
  } else {
    grunt.log.writeln('cache disable.');
  }
  grunt.log.writeln('SQL connection from `%s` (profile: %s).', configPath, profilename);

  profile = config[profilename];
  if (typeof profile === 'undefined') {
    grunt.log.error('Unknown profile `%s`.', profilename);
    return false;
  }

  var sequelize = new Sequelize(profile.database, profile.username, profile.password, profile),
      Album = require(root + '/models/Album.js')(sequelize, Sequelize),
      Artist = require(root + '/models/Artist.js')(sequelize, Sequelize),
      Track = require(root + '/models/Track.js')(sequelize, Sequelize);

  sequelize
    .authenticate()
    .complete(function(err) {
      if (!!err) {
        grunt.log.error(err);
        done(false);
      } else {
        var count, complete;

        watcher = new Watcher(pathAudio, extensions, options);
        count = watcher.watch(cache);
        complete = function() { if (--count <= 0) { done(true); } };

        grunt.log.writeln('%s file(s) to add.', count);
        if (count === 0) {
          done(true);
        } else {
          /** @var api/file/File file */
          watcher.each(function(file, index, length) {
            ffmpeg.ffprobe(file.getFullPath(), function(err, metadata) {
              if (err) {
                grunt.log.error('Error: ffmpeg ffprobe');
                grunt.log.error(err);
                return false;
              }

              var tags = metadata.format.tags || {},
                  title, artistName, albumName;

              title = getTag(tags, 'title', file) || file.getFileName(file.getExtension());
              artistName = getTag(tags, 'artist', file) || null;
              albumName = getTag(tags, 'album', file) || null;

              /* must be optimized ! :D */
              if (artistName !== null && albumName !== null) {
                Artist.findOrCreate({ name: artistName }).success(function(artist) {
                  Album.findOrCreate({ id_artist: artist.getDataValue('id'), name: albumName, path: file.getPath() }).success(function(album) {
                    Track
                      .create({ id_album: album.getDataValue('id'), path: file.getFullPath(), title: title })
                      .complete(complete)
                    ;
                  });
                });
              } else {
                Track
                  .create({ path: file.getFullPath(), title: title })
                  .complete(complete)
                ;
              }
            });
          });
        }
      }
    });
};

function getTag(tags, name, file) {
  var val = tags[name];
  if (typeof val === 'undefined') {
    console.log('missing `' + name + '` tag for `' + file.getFullPath() + '`.');
    return false;
  }

  return val;
}
