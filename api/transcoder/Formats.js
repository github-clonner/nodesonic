/** @module Transcoder */
/* jshint node:true */
'use strict';

var util = require('util'),
    ffmpeg = require('fluent-ffmpeg'),
    emitter = require('events').EventEmitter;

util.inherits(Formats, emitter);
module.exports = Formats;

/**
 * @class Formats loader
 */
function Formats() {
  emitter(this);

  this.loaded = false;
  this.formats = {};
}

Formats.prototype.load = function(callback) {
  var me = this;

  ffmpeg.getAvailableFormats(function(err, formats) {
    if (err === null) {
      me.formats = formats;
    }

    if (typeof callback === 'function' &&
        callback(err, formats) === false) {
      me.emit('load', new Error('formats callback return false.'), formats);
      return false;
    }

    if (err === null) {
      me.loaded = true;
    }

    me.emit('load', err, formats);
  });
};

Formats.prototype.get = function(name) {
  if (!this.loaded) {
    return null;
  }

  return this.formats[name];
};

Formats.prototype.has = function(name) {
  return !!this.formats[name];
};

Formats.prototype.isMuxable = function(name) {
  if (!this.loaded) {
    return false;
  }

  return this.formats[name].canMux;
};

Formats.prototype.isDemuxable = function(name) {
  if (!this.loaded) {
    return false;
  }

  return this.formats[name].canDemux;
};
