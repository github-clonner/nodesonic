/* jshint node:true */
'use strict';

var Sequelize = require('sequelize');

module.exports = function(information) {
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
};
