(function() {
  const util = require('util');
  const path = require('path');
  const fs = require('fs');
  const crypto = require('crypto');
  const url = require('url');
  const http = require('http');
  const formidable = require('formidable');

  formidable.IncomingForm.prototype.onPart = function(part) {
    if (!part.filename) {
      this.handlePart(part);
      return;
    }
    var self = this;
    var data = new Buffer(0);
    part.on('data', function(chunk) {
      var buffer = new Buffer(data.length + chunk.length);
      data.copy(buffer);
      chunk.copy(buffer, data.length);
      data = buffer;
    });
    part.on('end', function() {
      self.emit('file', part.name, data);
    });
  };

  function GyazoServer(options) {
    http.Server.call(this);
    options = options || {};
    this.upload_dir = options.upload_dir || '/tmp';
    this.required_id = options.required_id || null;
    this.on('request', this.receiveRequest);
    this.on('close', this.closeServer);
  }
  util.inherits(GyazoServer, http.Server);
  module.exports = GyazoServer;

  (function(proto) {
    var routes = {
      GET: {},
      POST: {}
    };
    routes.GET['/'] = function(request, response) {
      response.setHeader('Content-type', 'text/plain');
      response.write('= Gyazo Server\n');
      response.write('\n');
      response.write('source code: https://gist.github.com/1537311\n');
      response.end();
    };
    routes.GET['/402-payment-required'] = function(request, response) {
      response.statusCode = 402;
      response.setHeader('Content-type', 'text/plain');
      response.end(url.format({
        protocol: 'http',
        host: request.headers.host,
        pathname: '/'
      }));
    };
    routes.GET['/404-not-found'] = function(request, response) {
      response.statusCode = 404;
      response.setHeader('Content-type', 'text/plain');
      response.end('404 Not found.\n');
    };
    routes.POST['/upload.cgi'] = function(request, response) {
      var self = this;
      var form = new formidable.IncomingForm();
      form.parse(request, function(err, fields, files) {
        var id = fields.id || '';
        var imagedata = files.imagedata;
        var hash = crypto.createHash('md5').update(imagedata).digest('hex');
        var filename = hash + '.png';
        if (self.required_id && self.required_id !== id) {
          routes.GET['/402-payment-required'](request, response);
          return;
        };
        fs.writeFile(path.join(self.upload_dir, filename), imagedata, function(err) {
          response.setHeader('Content-type', 'text/plain');
          response.end(url.format({
            protocol: 'http',
            host: request.headers.host,
            pathname: '/' + filename
          }));
        });
      });
    };

    proto.receiveRequest = function(request, response) {
      var method = request.method.toUpperCase();
      var path = request.url;
      this._getFunction(method, path).call(this, request, response);
    };

    proto.closeServer = function() {
    };

    proto._getFunction = function(method, path) {
      return routes[method][path] || routes.GET['/404-not-found'];
    };
  })(GyazoServer.prototype);

  function main() {
    var env = process.env;
    var server = new GyazoServer({
      upload_dir: env.GYAZO_UPLOAD_DIR,
      required_id: env.GYAZO_REQUIRED_ID
    });
    server.on('request', function(request) {
      util.print('Request: ' + request.url + '\n');
    });
    server.on('close', function() {
      util.print('Close Server.\n');
    });
    util.print('Run Server.\n');
    server.listen(env.GYAZO_PORT || 8080);
  }

  if (require.main === module) {
    main();
  }
})();
