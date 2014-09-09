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
