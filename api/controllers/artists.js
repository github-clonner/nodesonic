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

  var uri = '/artists'; 
  var model = server.models.Artist;

  Controller(server, uri, model);

  console.log(getArtistAlbums);
  server.get(uri+'/:id/albums', getArtistAlbums);
}

var getArtistAlbums = function (req, res, next) {
  req.entity.getAlbums()
    .done(function(err, albums) {
      next.ifError(err);
      res.send(albums);
      next();
    });
}
