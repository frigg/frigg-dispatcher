#!/usr/bin/env node
/* eslint-disable no-console, no-var, vars-on-top, func-names */
var Promise = require('bluebird');
var appPromise;

function createSpacer(title) {
  return [
    '-------------------',
    title,
    '-------------------',
    '\n',
  ].join(' ');
}

if (process.env.NODE_ENV === 'production') {
  require('newrelic');
  var exec = Promise.promisify(require('child_process').exec);
  appPromise = exec('babel src -d dist')
    .spread(function(stdout, stderr) {
      console.log(createSpacer('stdout'), stdout);
      console.log(createSpacer('stderr'), stderr);
      return require('./dist/app');
    });
} else {
  require('babel/register');
  appPromise = Promise.resolve(require('./src/app'));
}

appPromise
  .then(function(app) {
    var server = app.listen(process.env.PORT || 3000, function listen() {
      console.log(
        '-----------------------------------------------\n',
        'Express app listening at http://%s:%s',
        server.address().address,
        server.address().port
      );
    });
  });
