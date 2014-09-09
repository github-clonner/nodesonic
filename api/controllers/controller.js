/** @namespace routes */
/* jshint node:true */
'use strict';

var util = require('util');
var restify = require('restify');

/**
  Generic controller
  @constructor
  @param {object} server - Current restify server.
*/
function Controller(server, uri, model) {

  server.use(function(req, res, next) {
    if (req.params.id) {
      return model.find(req.params.id)
        .complete(function(err, entity) {
          next.ifError(err);
          if (entity === null) {
            return next(new restify.ResourceNotFoundError());
          }
          else {
            req.entity = entity;
            return next()
          }
        });
    }
    next();
  });

  server.get(uri, function(req, res, next) {
    model.findAll()
      .done(function(err, artists){
        next.ifError(err);
        res.send(artists);
        next();
      })
  });

  server.get(uri+'/:id', function(req, res, next) {
    res.send(req.entity);
    next();
  });

  server.del(uri+'/:id', function(req, res, next) {
    req.entity.destroy()
      .done(function (err, result) {
        next.ifError(err);
        res.send(200, null);
        next();
      });
  });

}

module.exports = Controller;