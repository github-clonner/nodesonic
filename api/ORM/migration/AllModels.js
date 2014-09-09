/* jshint node:true */
'use strict';

module.exports = function(migration, DataTypes, modelsPath) {
  var sequelize, models, model;

  sequelize = require('../newConnection')({});
  models = require('../loadModels')(sequelize, modelsPath);

  Object.keys(models).forEach(function(modelName) {
    model = models[modelName];

    migration.createTable(model.tableName, model.rawAttributes);
  });
};
