#!/usr/bin/env node
(function() {
  const util = require('util');
  const GyazoServer = require('../lib/gyazo-server');

  function main() {
    var argv = process.argv;
    var options = optparser(argv, {
      debug: false,
      port: 8080,
      upload_dir: '/tmp',
      required_id: null
    });
    listen(options);
  }

  function listen(options) {
    var server = new GyazoServer(options);
    if (options.debug) {
      server.on('listening', function() {
        util.puts('Run Gyazo Server.');
        util.puts(util.inspect(options));
      });
      server.on('request', function(request, response) {
        var method = request.method.toUpperCase();
        util.puts('Request: ' + method + ' ' + request.url);
      });
    }
    server.listen(options.port);
  }

  function optparser(argv, options) {
    options = options || {};
    argv.forEach(function(opt) {
      if (opt.slice(0, 2) !== '--') {
        return;
      }
      var _ = opt.split('=');
      var key = _[0].slice(2).replace(/-/g, '_');
      options[key] = _[1] || true;
    });
    return options;
  }

  if (require.main === module) {
    main();
  }
})();
