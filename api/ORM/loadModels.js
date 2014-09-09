/* jshint node:true */
'use strict';

var fs = require('fs'),
    path = require('path');

module.exports = function loadModels(sequelize, pathModels) {
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
};
