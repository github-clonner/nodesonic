/** @module Codecs */
/* jshint node:true */
'use strict';

var util = require('util'),
    ffmpeg = require('fluent-ffmpeg'),
    emitter = require('events').EventEmitter;

util.inherits(Codecs, emitter);
module.exports = Codecs;

function Codecs() {
  emitter(this);

  this.loaded = false;
  this.codecs = {};
}

Codecs.prototype.load = function(callback) {
  var me = this;

  ffmpeg.getAvailableCodecs(function(err, codecs) {
    if (err === null) {
      me.codecs = codecs;
    }

    if (typeof callback === 'function' &&
        callback(err, codecs) === false) {
      me.emit('error', new Error('codecs callback return false.'));
      return false;
    }

    if (err === null) {
      me.loaded = true;
      me.emit('load', codecs);
    } else {
      me.emit('error', err);
    }
  });
};

Codecs.prototype.get = function(name) {
  if (!this.loaded) {
    return null;
  }

  return this.codecs[name];
};

Codecs.prototype.has = function(name) {
  return !!this.codecs[name];
};

Codecs.prototype.isEncodable = function(name) {
  if (!this.loaded) {
    return false;
  }

  return this.codecs[name].canEncode;
};

Codecs.prototype.isDecodable = function(name) {
  if (!this.loaded) {
    return false;
  }

  return this.codecs[name].canDecode;
};
