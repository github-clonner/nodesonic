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
function ArtistsController(server) {

  var uri = '/artists';
  var model = server.models.Artist;

  ArtistsController.super_(server, uri, model);

  server.get(uri+'/:id/albums', function(req, res, next) {
    req.entity.getAlbums()
      .done(function(err, albums) {
        next.ifError(err)
        res.send(albums);
        next();
      });
  });

}

util.inherits(ArtistsController, Controller); 

module.exports = ArtistsController;