#!/usr/bin/env node
/* eslint-disable no-console, no-var, vars-on-top, func-names, global-require, prefer-template */
/* eslint-disable prefer-arrow-callback */
var Promise = require('bluebird');
var path = require('path');
var appPromise;

function createSpacer(title) {
  return [
    '-------------------',
    title,
    '-------------------',
    '\n',
  ].join(' ');
}

if (process.env.NODE_ENV === '-production-') {
  try {
    require('newrelic');
  } catch (error) {
    console.log(error);
  }

  var exec = Promise.promisify(require('child_process').exec);
  var babel = path.resolve(__dirname, 'node_modules/.bin/babel');
  appPromise = exec(babel + ' src -d dist')
    .spread(function (stdout, stderr) {
      console.log(createSpacer('stdout'), stdout);
      console.log(createSpacer('stderr'), stderr);
      return require('./dist/app');
    });
} else {
  require('babel-core/register');
  appPromise = Promise.resolve(require('./src/app'));
}

appPromise
  .then(function (app) {
    var server = app.listen(process.env.PORT || 3000, function listen() {
      console.log(
        '-----------------------------------------------\n',
        'Express app listening at http://localhost:' + server.address().port
      );
    });
  });
