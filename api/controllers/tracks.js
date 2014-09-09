/** @namespace routes */
/* jshint node:true */
'use strict';

var util = require('util');
var Controller = require('./controller.js');


/**
  tracks controller
  @constructor
  @param {object} server - Current restify server.
*/
function TracksController(server) {
  TracksController.super_(server, 'tracks', server.models.Track);

  // A refactorer
  // if range not found > start = 0; end=filesize
  server.get('/tracks/:id/stream', function(req, res, next) {
    var id = decodeURIComponent(req.params.id);
    var range = req.headers.range;
    var options = {
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
        res.send(404, null);
        return ;
      }

      var path = music.getDataValue('path');
      if (fs.existsSync(path)) {
        var parts = range.replace(/bytes=/, '').split('-');
        var start = options.start = parseInt(parts[0], 10);
        var end;

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

}

util.inherits(TracksController, Controller); 

module.exports = TracksController;