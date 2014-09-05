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

/** @abstract */
AbstractTranscoder.prototype.__transcode = function() {
  throw new Error('must be overriden.');
};

AbstractTranscoder.prototype.getFileSize = function() {
  if (this.bitrate === 0 || this.duration === 0) {
    return 0;
  }

  return ((this.bitrate * this.duration) / 8);
};

/**
 @constructor
 @description Class used for transcode audio file.
 @param {object} options
*/
function Audio(options) {
  AbstractTranscoder.prototype.constructor.call(this, options);
}

util.inherits(Audio, AbstractTranscoder);

Audio.prototype.__transcode = function() {
  var options = this.options,
      onStart = options.onStart,
      onProgress = options.onProgress,
      onEnd = options.onEnd,
      onError = options.onError,
      output = this.options.output;

  this.command = new ffmpeg({ source: this.input, nolog: true });

  if (!this.command) {
    throw new Error('Something went wrong withL `' + this.path + '`.');
  }

  this.command.
    withNoVideo().
    withAudioCodec('libmp3lame').
    withAudioBitrate(this.bitrate).
    withAudioChannels(2).
    fromFormat(this.format).
    toFormat('mp3');

  /* onStart(commandline) */
  if (typeof onStart === 'function') {
    this.command.on('start', onStart);
  }

  /* onProgress(process) */
  if (typeof onProgress === 'function') {
    this.command.on('progress', onProgress);
  }

  /* onEnd(commandline) */
  if (typeof onEnd === 'function') {
    this.command.on('end', onEnd);
  }

  /* onError(commandline) */
  if (typeof onError === 'function') {
    this.command.on('error', onError);
  }

  if (typeof output.path === 'string') {
    this.command.saveToFile(output.path);
  } else if (typeof output.stream === 'object') {
    this.command.writeToStream(output.stream, output.options || {});
  }

  return this.command;
};

exports.Audio = Audio;
