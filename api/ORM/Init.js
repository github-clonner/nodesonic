/*jshint node:true */
'use strict';

var fs = require('fs'),
    path = require('path'),
    Sequelize = require('sequelize');

module.exports = function(server, callback) {

  server.ORM = newConnection(server.settings.get('database'));
  server.models = loadModels(server.ORM, server.settings.get('paths.model'));

  tryConnection(server.ORM, callback);
};

function loadModels(sequelize, pathModels) {
  var model, models;

  models = {};
  fs
    .readdirSync(pathModels)
    .filter(function(file) { return (file.indexOf('.') !== 0) && (file !== 'index.js'); })
    .forEach(function(file) {
      model = sequelize.import(path.join(pathModels, file));
      models[model.name] = model;
    });

  Object.keys(models).forEach(function(modelName) {
    if ('associate' in models[modelName]) {
      models[modelName].associate(models);
    }
  });

  return models;
}

function tryConnection(connection, callback) {
  connection
    .authenticate()
    .complete(callback)
  ;
}

function newConnection(information) {
  var options = {};

  if (typeof information.host !== 'undefined') {
    options.host = information.host;
  }

  if (typeof information.dialect !== 'undefined') {
    options.dialect = information.dialect;
  }

  if (typeof information.logging !== 'undefined') {
    options.logging = information.logging;
  }

  return new Sequelize(information.database, information.username, information.password, options);
}
