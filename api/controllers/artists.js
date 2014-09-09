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

  ArtistsController.super_(server, 'artists', server.models.Artist);

  server.get('/artists/:id/albums', function(req, res, next) {
    var id = decodeURIComponent(req.params.id);

    this.models.Artist.find({ where: { id: id } })
      .complete(function(err, artist) {
        if (err) {
          res.send(500, err);
          return next();
        }

        if (artist === null) {
          res.send(404, null);
          next();
        } else {
          artist.getAlbums().complete(function(err, albums) {
            if (err) {
              res.send(500, err);
              return next();
            }

            res.send(albums);
            next();
          });
        }
     });
  });

}

util.inherits(ArtistsController, Controller); 

module.exports = ArtistsController;