/** @module File */
/* jshint node:true */
'use strict';

var path = require('path');

/**
  @constructor
  @description File class abstraction.
  @param {string} fullpath -
    absolute path of this file
*/
function File(fullpath) {
  this._fullpath = fullpath;
}

/**
  @method
  @description Get absolute path without file name.
*/
File.prototype.getPath = function() {
  return path.dirname(this._fullpath);
};

/**
  @method
  @description Get absolute path with file name.
*/
File.prototype.getFullPath = function() {
  return this._fullpath;
};

/**
 @method
 @description Get file name.
 @param {string} [extension] -
  Ignore extension.
*/
File.prototype.getFileName = function(extension) {
  return path.basename(this._fullpath, extension);
};

/**
  @method
  @description Get extension of the current file.
*/
File.prototype.getExtension = function() {
  return path.extname(this._fullpath);
};

module.exports = File;
