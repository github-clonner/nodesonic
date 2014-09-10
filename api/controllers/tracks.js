/** @namespace routes */
/* jshint node:true */
'use strict';

var fs = require('fs');
var util = require('util');
var Audio = require('../transcoder/Audio');
var Controller = require('./controller.js');
var restify = require('restify');


/**
  tracks controller
  @constructor
  @param {object} server - Current restify server.
*/

module.exports = function(server) {
  var uri = '/tracks';
  var model = server.models.Track;

  Controller(server, uri, model);

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

    if (!fs.existsSync(path)) {
      return next(new restify.errors.InternalError('File path does not exist'));
    }

    res.status(206);
    res.header('Transfer-Encoding', 'chunked');
    res.header('Content-type', 'audio/mpeg');
    res.header('Accept-Ranges', 'bytes');
    res.header('Connection', 'close');

    var inStream = fs.createReadStream(path, options);
    var options = {
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
        next();
      },
      codecs: server.codecs,
      formats: server.formats
    };

    var audio = new Audio(options);

    audio.on('transcode', function() {
      var total = audio.getFileSize();
      if (!end) {
        end = total - 1;
      }

      res.header('Content-Range', 'bytes ' + start + '-' + end + '/' + total);
      res.header('Content-Length', end - start + 1);
    });

    audio.on('error', function(err) {
      server.log.error(err);
      res.send(500);
      next();
     });

    audio.transcode();
  });

}
