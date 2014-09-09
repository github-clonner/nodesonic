/** @namespace routes */
/* jshint node:true */
'use strict';

var fs = require('fs');
var util = require('util');
var Audio = require('../transcoder/Audio');
var Controller = require('./controller.js');


/**
  tracks controller
  @constructor
  @param {object} server - Current restify server.
*/
function TracksController(server) {
  var uri = '/tracks';
  var model = server.models.Track;

  TracksController.super_(server, uri, model);

  server.get(uri+'/:id/stream', function(req, res, next) {
    var range = req.headers.range;
    var start, end;
    var options = {
      flags: 'r',
      autoClose: true
    };

    if (typeof range === 'undefined') {
      start = options.start = 0;
    } else {
      var parts = range.replace(/bytes=/, '').split('-');
      start = options.start = parseInt(parts[0], 10);

      if (parts[1]) {
        options.end = end = parseInt(parts[1], 10);
      }
    }

    var music = req.entity;
    var path = music.getDataValue('path');
    if (fs.existsSync(path)) {
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
              server.log.error(err);
              res.send(500);
              next();
            },
            onEnd: function() {
              res.status(200);
              next();
            },
            codecs: server.codecs,
            formats: server.formats
          }).on('transcode', function() {
            var total = e.getFileSize();

            if (!end) {
              end = total - 1;
            }

            res.header('Content-Range', 'bytes ' + start + '-' + end + '/' + total);
            res.header('Content-Length', end - start + 1);
          }).on('error', function(err) {
            server.log.error(err);
            res.send(500);
            next();
          });

        e.transcode();

    } else {
      res.send(404);
      next(false);
    }
  });

}

util.inherits(TracksController, Controller);

module.exports = TracksController;
