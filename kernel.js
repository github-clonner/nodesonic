/*jshint node:true */
'use strict';

var fs = require('fs'),
    restify = require('restify'),
    Sequelize = require('sequelize'),
    Setting = require(__dirname + '/api/setting/Setting.js'),
    Codecs = require(__dirname + '/api/transcoder/Codecs.js'),
    Formats = require(__dirname + '/api/transcoder/Formats.js');

// @TODO regarder restify Serve Static

/** + Setting */
var setting = new Setting(__dirname + '/config/server.json')
  .set({
    application: {
      name: 'nodesonic'
    },
    paths: {
      root: __dirname,
      api: __dirname + '/api',
      source: __dirname + '/source',
      cache: __dirname + '/cache',
      config: __dirname + '/config',
      model: __dirname + '/models',
      log: __dirname + '/log',
      audio: __dirname + '/audio'
    },
    info: {
      version: '0.0.1'
    }
  });

var unixUser = process.env.USER;
if (unixUser) {
  var unixUserPath = setting.get('paths.config') + '/server/' + unixUser + '.json';
  if (fs.existsSync(unixUserPath)) {
    setting.override(unixUserPath);
  }
}
/** - Setting */

/** + Server Options */
var options = {
  name: setting.get('application.name'),
  version: setting.get('info.version')
};

if (setting.get('log.enable') === true) {
  var bunyan = require('bunyan');

  options.log = bunyan.createLogger({
    name: setting.get('application.name'),
    streams: [
      {
        type: 'rotating-file',
        path: setting.get('paths.log') + '/all.log',
        period: '1d',
        count: 3,
        level: bunyan.INFO
      },
      {
        path: setting.get('paths.log') + '/error.log',
        level: bunyan.ERROR
      },
      {
        stream: process.stdout,
        level: bunyan.INFO
      }
    ]
  });
}
/** - Server Options */

var server = restify.createServer(options);

server.settings = setting.lock();
server.codecs = new Codecs();
server.formats = new Formats();

server.formats.once('load', onLoadFormats);
server.codecs.once('load', onLoadCodecs);

require('./api/ORM/Init.js')(server, function(err) {
  if (!!err) {
    server.log.error('Unable to connect to the database.');
    server.log.error(err);
    return ;
  }

  server.codecs.load();
  server.formats.load();
});







function launchServer(server) {

  require('./api/routes.js')(server);
  require('./api/controllers/artists.js')(server);
  require('./api/controllers/albums.js')(server);
  require('./api/controllers/tracks.js')(server);
  
  server.log.info('SQL Connection has been established successfully.');

  server.listen(server.settings.get('port'), function() {
    server.log.info('%s listening at %s', server.name, server.url);
  });

  process.on('SIGINT', function() {
    server.log.info('server shutdown.');
    process.exit();
  });
}

function onLoadFormats(err, formats) {
  if (!!err) {
    server.log.error('Formats load failed.');
    server.log.error(err);
  } else {
    server.log.info('Formats loaded.');
    if (server.formats.loaded && server.codecs.loaded) {
      launchServer(server);
    }
  }
}

function onLoadCodecs(err, codecs) {
  if (!!err) {
    server.log.error('Codecs load failed.');
    server.log.error(err);
  } else {
    server.log.info('Codecs loaded.');
    if (server.formats.loaded && server.codecs.loaded) {
      launchServer(server);
    }
  }
}
