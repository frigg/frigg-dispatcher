#!/usr/local/bin/node

if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

var app = require('./dist/app');
var server = app.listen(process.env.PORT || 3000, function() {
  console.log(
    'express app listening at http://%s:%s',
    server.address().address,
    server.address().port
  );
});
