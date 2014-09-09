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
function AlbumsController(server) {

  AlbumsController.super_(server, 'albums', server.models.Album);

  server.get('/albums/:id/tracks', function(req, res, next) {
    var id = decodeURIComponent(req.params.id);

    this.models.Album.find({ where: { id: id } })
      .complete(function(err, album) {
        if (err) {
          res.send(500, err);
          return next();
        }

        if (album === null) {
          res.send(404, null);
          next();
        } else {
          album.getTracks().complete(function(err, tracks) {
            if (err) {
              res.send(500, err);
              return next();
            }

            res.send(tracks);
            next();
          });
        }
     });
  });

}

util.inherits(AlbumsController, Controller); 

module.exports = AlbumsController;