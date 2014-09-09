/*jshint node:true */
'use strict';

var fs = require('fs'),
    path = require('path'),
    Sequelize = require('sequelize');

module.exports = function(server, callback) {

  server.ORM = require('./newConnection')(server.settings.get('database'));
  server.models = require('./loadModels')(server.ORM, server.settings.get('paths.model'));

  tryConnection(server.ORM, callback);
};

function tryConnection(connection, callback) {
  connection
    .authenticate()
    .complete(callback)
  ;
}
