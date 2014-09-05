/** @module Finder */
/*jshint node:true */
'use strict';

var fs = require('fs'),
    path = require('path');

var File = require('../file/File.js');

/**
  @constructor
*/
function Finder(root) {
  this._root = root;
  this._extensions = [];

  this._rootCheck();
  this.reset();
}

Finder.prototype.next = function(callback, scope) {
  var current = null;

  if (!this._pool.length) {
    return null;
  }

  var pool = this._pool,
      i, l, p, dir, file;

  if (!pool.dir) {
    pool.dir = fs.readdirSync(pool[0]);
  }

  for (i = pool.idx, l = pool.dir.length ; i < l ; ++i) {
    current = pool.dir[i];
    p = path.join(pool[0], current);

    if (!!~this._extensions.indexOf(path.extname(p))) {
      pool.idx = i + 1;

      file = new File(path.resolve(p));
      if (typeof callback === 'function') {
        callback.call(scope || this, file);
      }

      return file;
    } else if (this._isDirectory(p)) {
      pool.push(p);
    }
  }

  pool.shift();
  pool.idx = 0;
  pool.dir = null;

  return this.next(callback, scope);
};

/**
  @method
  @description Reset iterator.
*/
Finder.prototype.reset = function() {
  this._pool = [this._root];

  this._pool.idx = 0;
  this._pool.dir = null;
};

/**
  @method
  @description Find and return the first file or null.
  @param {string} filename
  @return {@link module:File~File}|null
*/
Finder.prototype.find = function(filename) {
  var next;

  this.reset();
  while ((next = this.next()) !== null) {
    if (next.getFileName() === filename) {
      return next;
    }
  }

  return next;
};

Finder.prototype.each = function(callback, scope) {
  if (typeof callback !== 'function') {
    return null;
  }

  var next;
  this.reset();
  while ((next = this.next()) !== null) {
    callback.call(scope || this, next);
  }
};

Finder.prototype.extensions = function(extensions) {
  if (typeof extensions === 'string') {
    if (!~this._extensions.indexOf(extensions)) {
      this._extensions.push(extensions);
    }

    return this;
  } else if (Array.isArray(extensions)) {
    var i, l, array = [];

    for (i = 0, l = extensions.length ; i < l ; ++i) {
      if (!~this._extensions.indexOf(extensions[i])) {
        array.push(extensions[i]);
      }
    }

    this._extensions = this._extensions.concat(array);
    return this;
  }

  return this._extensions;
};

Finder.prototype.getExtensions = function() {
  return this._extensions;
};

Finder.prototype._rootCheck = function() {
  if (fs.existsSync(this._root)) {
    var stat = fs.statSync(this._root);

    if (!stat.isDirectory()) {
      throw new Error('root `' + this._root + '` must be a directory.');
    }
  } else {
    throw new Error('`' + this._root + '` doesn\'t exist.');
  }

  return true;
};

Finder.prototype._isDirectory = function(directory) {
  return fs.statSync(directory).isDirectory();
};

module.exports = Finder;
