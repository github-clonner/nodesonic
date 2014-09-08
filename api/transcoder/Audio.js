/** @module Transcoder */
var util = require('util'),
    ffmpeg = require('fluent-ffmpeg'),
    AbstractTranscoder = require('./AbstractTranscoder.js');

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

module.exports = Audio;
