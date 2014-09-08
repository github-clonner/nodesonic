/** @module Transcoder */
/* jshint node:true */
'use strict';

var util = require('util'),
    ffmpeg = require('fluent-ffmpeg'),
    emitter = require('events').EventEmitter;

util.inherits(AbstractTranscoder, emitter);

/**
  @abstract
  @constructor
  @params {object} options
*/
function AbstractTranscoder(options) {
  var codecs = options.codecs,
      formats = options.formats,
      bitrate = options.bitrate || '320';

  this.codecs = typeof codecs === 'object' ? codecs : {};
  this.formats = typeof formats === 'object' ? formats : {};

  this.input = options.input;
  if (typeof this.input !== 'string' && typeof this.input !== 'object') {
    throw new Error('Input must be a path or a stream');
  }

  this.path = typeof this.input === 'string' ? this.input : this.input.path;

  this.output = options.output;
  if (!this.output || typeof this.output !== 'object') {
    throw new Error('Output must be a path or a stream');
  }

  this.bitrate = parseInt(bitrate, 10) * 1000;

  this.options = options;
  emitter.call(this);
}

/**
  @method
  @description Transcode something.
  @fires AbstractTranscoder#transcode
*/
AbstractTranscoder.prototype.transcode = function() {
  var me = this;

  ffmpeg.ffprobe(this.path, function(err, metadata) {
    if (err === null) {
      me.metadata = metadata;
      me.duration = parseInt(metadata.format.duration, 10);

      if ((err = me._transcodeIsAvailable()) ===  null) {
        me.__transcode();
        me.emit('transcode');
        return ;
      }
    }

    me.emit('error', err);
  });
};

AbstractTranscoder.prototype._transcodeIsAvailable = function() {
  var formatNames = this.metadata.format.format_name.split(/,/),
      formatName, i, length;

  for (i = 0, length = formatNames.length ; i < length ; ++i) {
    formatName = formatNames[i];

    if (this.codecs.has(formatName) && this.codecs.isDecodable(formatName)) {
      this.format = formatName;
      return null;
    }
  }

  return new Error('No format available for `' + formatNames.join(', ') + '`.');
};

/**
  @description This method should be override.
  @abstract
*/
AbstractTranscoder.prototype.__transcode = function() {
  throw new Error('must be overriden.');
};

/**
  @method
  @description get File Size calcultated with bitrate and duration.
*/
AbstractTranscoder.prototype.getFileSize = function() {
  if (this.bitrate === 0 || this.duration === 0) {
    return 0;
  }

  return ((this.bitrate * this.duration) / 8);
};

module.exports = AbstractTranscoder;
