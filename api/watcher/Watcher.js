/** @module Watcher */
/* jshint node:true */
'use strict';

var fs = require('fs'),
    crypto = require('crypto');

var Finder = require('../finder/Finder.js'),
    File = require('../file/File.js');

module.exports = Watcher;

function Watcher(root, extensions, opts) {
  if (typeof root !== 'string') {
    throw new Error('root must be a string.');
  }

  this._root = root;
  this._opts = opts || {};
  this._files = [];
  if (typeof this._opts.cache === 'string') {
    this._cache = {
      path: this._opts.cache,
      content: [],
      format: 'json',
      encode: opts.encode || false
    };

    this._initCache();
  }

  this._finder = new Finder(this._root).
    extensions(extensions)
  ;
}

Watcher.prototype.each = function(callback) {
  var i, l, file;

  for (i = 0, l = this._files.length ; i < l ; ++i) {
    file = this._files[i];

    if (callback(file, i, l) === false) {
      return i;
    }
  }

  return i;
};

Watcher.prototype._initCache = function() {
  var content, c, i, l;

  content = fs.readFileSync(this._cache.path, { flag: 'a+' }).toString('utf8');
  if (!content) {
    return ;
  }

  if (this._cache.encode) {
    content = this._decode(content);
  }
  content = JSON.parse(content);


  for (i = 0, l = content.length ; i < l ; ++i) {
    c = content[i];

    if (this._cache.encode) {
      c = this._decode(c);
    }

    this._cache.content.push(new File(c));
  }
};

Watcher.prototype.watch = function(save) {
  this._finder.each(function(file) {
    if (!this.alreadyKnown(file)) {
      this._files.push(file);
    }
  }, this);

  if (save) {
    this.save();
  }

  return this._files.length;
};

Watcher.prototype.alreadyKnown = function(file) {
  var i, l;

  if (!this.hasCache()) {
    return false;
  }

  for (i = 0, l = this._cache.content.length ; i < l ; ++i) {
    if (this._cache.content[i].getFullPath() === file.getFullPath()) {
      return true;
    }
  }

  return false;
};

Watcher.prototype.hasCache = function() {
  return typeof this._cache !== 'undefined';
};

Watcher.prototype.save = function() {
  if (!this.hasCache()) {
    throw new Error('no cache configuration found.');
  }

  var i, l, data, content, file;

  data = [];
  for (i = 0, l = this._cache.content.length ; i < l ; ++i) {
    file = this._cache.content[i].getFullPath();

    if (this._cache.encode) {
      file = this._encode(file);
    }

    data.push(file);
  }

  for (i = 0, l = this._files.length ; i < l ; ++i) {
    file = this._files[i].getFullPath();

    if (this._cache.encode) {
      file = this._encode(file);
    }

    data.push(file);
  }

  content = JSON.stringify(data);
  if (this._cache.encode) {
    content = this._encode(content);
  }

  fs.writeFileSync(this._cache.path, content);
};

Watcher.prototype._encode = function(fullname) {
  return new Buffer(fullname).toString('base64');
};

Watcher.prototype._decode = function(fullname) {
  return new Buffer(fullname, 'base64').toString('utf8');
};
