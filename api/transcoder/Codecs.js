/** @module Transcoder */
/* jshint node:true */
'use strict';

var util = require('util'),
    ffmpeg = require('fluent-ffmpeg'),
    emitter = require('events').EventEmitter;

util.inherits(Codecs, emitter);
module.exports = Codecs;

/**
  @constructor
*/
function Codecs() {
  emitter(this);

  this.loaded = false;
  this.codecs = {};
}

/**
  @fire load
*/
Codecs.prototype.load = function(callback) {
  var me = this;

  ffmpeg.getAvailableCodecs(function(err, codecs) {
    if (err === null) {
      me.codecs = codecs;
    }

    if (typeof callback === 'function' &&
        callback(err, codecs) === false) {
      me.emit('load', new Error('codecs callback return false.'), codecs);
      return false;
    }

    if (err === null) {
      me.loaded = true;
    }

    me.emit('load', err, codecs);
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
