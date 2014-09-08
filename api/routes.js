/** @namespace routes */
/* jshint node:true */
'use strict';

var fs = require('fs'),
    spawn = require('child_process').spawn,
    Audio = require('./transcoder/Audio.js');

/**
  Routes of webservice
  @constructor
  @param {object} server - Current restify server.
*/
module.exports = function(server) {

  //req.log.info('Hello there %s', req.params.name);

  server.get('/artist/all', function(req, res, next) {
    this.models.Artist.findAll().success(function(artists) {
      res.send(artists);
      next();
    });
  });

  server.get('/artist/:artist', function(req, res, next) {
    var name = decodeURIComponent(req.params.artist);
    this.models.Artist.find({ where: { name: name } }).complete(function(err, artist) {
      end(artist, res, next);
    });
  });

  server.get('/artist/:artist/albums', function(req, res, next) {
    var name = decodeURIComponent(req.params.artist);
    this.models.Artist.find({ where: { name: name } }).complete(function(err, artist) {
      if (artist === null) {
        end(null, res, next);
      } else {
        artist.getAlbums().complete(function(err, albums) {
          end(albums, res, next);
        });
      }
    });
  });

  server.get('/artist/:artist/album/:album', function(req, res, next) {
    var name = decodeURIComponent(req.params.artist);
    this.models.Artist.find({ where: { name: name } }).complete(function(err, artist) {
      if (artist === null) {
        end(null, res, next);
      } else {
        name = decodeURIComponent(req.params.album);
        artist.getAlbums({ where: { name: name } }).complete(function(err, album) {
          end(album, res, next);
        });
      }
    });
  });

  server.get('/album/all', function(req, res, next) {
    this.models.Album.findAll().success(function(albums) {
      end(albums, res, next);
    });
  });

  server.get('/album/:album', function(req, res, next) {
    var name = decodeURIComponent(req.params.album);
    this.models.Album.find({ where: { name: name } }).success(function(album) {
      end(album, res, next);
    });
  });

  server.get('/music/all', function(req, res, next) {
    this.models.Music.findAll().success(function(musics) {
      end(musics, res, next);
    });
  });

  server.get('/music/:music', function(req, res, next) {
    var name = decodeURIComponent(req.params.music);
    this.models.Music.find({ where: { name: name } }).complete(function(err, music) {
      end(music, res, next);
    });
  });

  server.get(/^[\/\w]*\/audio--(.*)/, function(req, res, next) {
    var id = req.params[0],
        range = req.headers.range,
        options = {
          flags: 'r',
          autoClose: true
        };

    if (typeof range === 'undefined') {
      res.send('range undefined.');
      next();
    }

    this.models.Music.find({ where: { id: id } }).complete(function(err, music) {
      if (err !== null) {
        res.send(500, err);
        return ;
      }
      if (music === null) {
        res.send(404, 'not found');
        return ;
      }

      var path = music.getDataValue('path');
      if (fs.existsSync(path)) {
        var parts = range.replace(/bytes=/, '').split('-'),
            start = options.start = parseInt(parts[0], 10),
            end;

        if (parts[1]) {
          options.end = end = parseInt(parts[1], 10);
        }

        res.status(206);
        res.header('Transfer-Encoding', 'chunked');
        res.header('Content-type', 'audio/mpeg');
        res.header('Accept-Ranges', 'bytes');
        res.header('Connection', 'close');

        var inStream = fs.createReadStream(path, options),
            e = new Audio({
              input: inStream,
              output: {
                stream: res,
                options: { end: false }
              },
              onError: function(err) {
                console.log('An error occurred: ' + err.message);
                next();
              },
              onEnd: function() {
                res.status(200);
                console.log('end');
                next();
              },
              codecs: server.codecs,
              formats: server.formats
            }).on('transcode', function() {
              console.log('transcode');
              var total = e.getFileSize();

              if (!end) {
                end = total - 1;
              }

              res.header('Content-Range', 'bytes ' + start + '-' + end + '/' + total);
              res.header('Content-Length', end - start + 1);
            }).on('error', function(err) {
              console.log('An error occurred: ' + err.message);
            });

          e.transcode();

      } else {
        res.send(200, 'file not found');
        return false;
      }
    });
  });

  server.get('/archive/:id', function(req, res, next) {
    archive(this, req, res, next);
  });

};

function archive(server, req, res, next) {
  var id = req.params.id,
      name = '/tmp/bob',
      source;

  server.models.Album.find({ where: { id: id }, attributes: [ 'path' ] }).complete(function(err, album) {
    console.log(err, album);
    if (err !== null) {
      return false;
    }

    if (album === null) {
      res.send(404, 'Album `' + id + '` not found.');
      return false;
    }

    source = album.getDataValue('path');
    var grunt = spawn('grunt', [
      'nodesonic:audio:compress',
      '--source', source,
      '--name', name
    ]);

    grunt.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    grunt.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    grunt.on('close', function (code) {
      console.log('child process exited with code ' + code);
    });

    end({ source: source, name: name + '.zip' }, res, next);
  });

}

function end(content, res, next) {
  if (content === null) {
    content = {};
  }

  res.send(content);
  next();
}
