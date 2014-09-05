/** @namespace routes */
/*jshint node:true */
'use strict';

/**
 * Routes of webservice
 * @param {object} server - Current restify server.
 */
module.exports = function(server) {

  //req.log.info('Hello there %s', req.params.name);

  /**
    @method
    @description Get all artist.
  */
  server.get('/artist/all', function(req, res, next) {
    this.models.Artist.findAll().success(function(artists) {
      res.send(artists);
      next();
    });
  });

  /**
    @method
    @description Get one artist by name.
    @params {string} name -
      Artist name.
  */
  server.get('/artist/:artist', function(req, res, next) {
    var name = decodeURIComponent(req.params.artist);
    this.models.Artist.find({ where: { name: name } }).complete(function(err, artist) {
      res.send(artist !== null ? artist : {});
      next();
    });
  });

  server.get('/album/all', function(req, res, next) {
    this.models.Album.findAll().success(function(albums) {
      res.send(albums);
      next();
    });
  });

  server.get('/album/:album', function(req, res, next) {
    var name = decodeURIComponent(req.params.album);
    this.models.Album.find({ where: { name: name } }).success(function(album) {
      res.send(album !== null ? album : {});
      next();
    });
  });

  server.get('/music/all', function(req, res, next) {
    this.models.Music.findAll().success(function(musics) {
      res.send(musics);
      next();
    });
  });
};
