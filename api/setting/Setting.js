/** @module Setting */
/* jshint node:true */
'use strict';

var fs = require('fs');

/**
  @constructor
  @param {string} [path] -
    Path of default settings.
*/
function Setting(path) {
  this.isLock = false;
  this.settings = {};

  if (path) {
    this.settings = require(path);
  }
}

/**
  @method
  @description Get setting. (setting.get('foo').bar and setting.get('foo.bar') are similar.)
  @param {string}
*/
Setting.prototype.get = function(name) {
  if (!this.has(name)) {
    throw new Error('Unknown setting `' + name + '`.');
  }

  if (!!~name.indexOf('.')) {
    var names = name.split('.'), i, l, setting;

    setting = this.get(names[0]);
    for (i = 1, l = names.length ; i < l ; ++i) {
      setting = setting[names[i]];
    }

    return setting;
  }

  return this.settings[name];
};

/**
  @method
  @description Add or update setting.
  @param {string|object} name -
    If name is an object, value param is not used.
    You can set directly 'foo.bar' instead of ('foo', { bar: 'bar' }).
  @param {mixed} [value] - value
*/
Setting.prototype.set = function(name, value) {
  this.locked();

  if (typeof name === 'string') {
    this._set(name, value);
  } else if (typeof name === 'object') {
    var settings = name;
    for (name in settings) {
      if (settings.hasOwnProperty(name)) {
        this.set(name, settings[name]);
      }
    }
  }
};

/**
  @method
  @description check if setting exist
  @param {string} name
*/
Setting.prototype.has = function(name) {
  if (!!~name.indexOf('.')) {
    var names = name.split('.'), i, l, setting;

    setting = this.settings[names[0]];
    if (typeof setting === 'undefined') {
      return false;
    }

    for (i = 1, l = names.length ; i < l ; ++i) {
      name = names[i];
      if (setting.hasOwnProperty(name)) {
        setting = setting[name];
      } else {
        return false;
      }
    }

    return true;
  }

  return typeof this.settings[name] !== 'undefined';
};

Setting.prototype._set = function(name, value) {
  if (!!~name.indexOf('.')) {
    var names = name.split('.'), n, i, l, setting;

    n = names[names.length - 1];
    names.pop();
    setting = this.get(names.join('.'));
    if (n) {
      setting[n] = value;
    }

    return ;
  }

  this.settings[name] = value;
};

/**
  @method
  @description Override or add some settings by a file.
  @param {string} path -
    Path of file.
*/
Setting.prototype.override = function(path) {
  this.locked();

  var settings = fs.readFileSync(path).toString();
  if (settings) {
    settings = JSON.parse(settings);
    this.set(settings);
  }
};

/**
  @method
  @description get all settings
*/
Setting.prototype.all = function() {
  return this.settings;
};

/**
  @method
  @description lock settings, then settings shouldn't be writable.
*/
Setting.prototype.lock = function() {
  this.isLock = true;
  return this;
};

Setting.prototype.locked = function() {
  if (this.isLock) {
    throw new Error('Can not override settings when it\'s locked.');
  }
};

module.exports = Setting;
