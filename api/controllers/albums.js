/** @namespace routes */
/* jshint node:true */
'use strict';

var util = require('util');
var Controller = require('./controller.js');

/**
  artists controller
  @constructor
  @param {object} server - Current restify server.
*/
module.exports = function(server) {
  var uri = '/albums';
  var model = server.models.Album;

  Controller(server, uri, model);

  server.get(uri+'/:id/tracks', function(req, res, next) {
    req.entity.getTracks()
      .done(function(err, albums) {
        next.ifError(err)
        res.send(albums);
        next();
      });
  });

}
