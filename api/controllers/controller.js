/** @namespace routes */
/* jshint node:true */
'use strict';

var util = require('util');

/**
  Generic controller
  @constructor
  @param {object} server - Current restify server.
*/
function Controller(server, name, model) {

  var uri = '/'+name;

  server.get(uri, function(req, res, next) {
    model.findAll()
      .success(function (artists) {
        res.send(artists);
        next();
      })
      .error(function (err) {
        res.send(500, err);
        next();
      });
  });

  server.get(uri+'/:id', function(req, res, next) {
    var id = decodeURIComponent(req.params.id);

    model.find({ where: { id: id } }).complete(function(err, entity) {
      if (err) {
        res.send(500, err);
        return next();
      }
      if (entity === null) {
        res.send(404, null);
        return next();
      }

      end(entity, res, next);
    });
  });

  server.del(uri+'/:id', function(req, res, next) {
    var id = decodeURIComponent(req.params.id);

    this.models.Artist
      .find({ where: { id: id } })
      .complete(function(err, entity) {
        if (err) {
          res.send(500, err);
          return next();
        }
        else if (entity === null) {
          res.send(404, null)
          return next()
        }

        entity.destroy()
          .success(function (){
            res.send(200, null);
            next()
          })
          .error(function(err) {
            res.send(500, err);
            next();
          });
    });
  });

}

function end(content, res, next) {
  if (content === null) {
    content = {};
  }

  res.send(content);
  next();
}

module.exports = Controller;