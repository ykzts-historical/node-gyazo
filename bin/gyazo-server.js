#!/usr/bin/env node
(function() {
  const optparse = require('optparse');
  const GyazoServer = require('../lib/gyazo-server');

  var options = {
    port: 8080,
    upload_dir: '/tmp',
    required_id: null
  }; 
  var parser = new optparse.OptionParser([
    ['--port NUMBER', 'Port number'],
    ['--upload-dir DIRECTORY', 'Upload Directory'],
    ['--required-id ID', 'Required ID (option)']
  ]);
  parser.banner = 'Usage: gyazo-server [options]';
  parser.on('port', function(name, value) {
    options.port = value;
  });
  parser.on('upload-dir', function(name, value) {
    options.upload_dir = value;
  });
  parser.on('required-id', function(name, value) {
    options.required_id = value;
  });
  parser.parse(process.argv);
  var server = new GyazoServer(options);
  server.listen(options.port);
})();
