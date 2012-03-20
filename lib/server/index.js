(function() {
  'use strict';

  var util = require('util');
  var path = require('path');
  var fs = require('fs');
  var http = require('http');
  var CONTENT_TYPES = require('./content-types');
  var routes = require('./routes');

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
    proto.receiveRequest = function(request, response) {
      var method = request.method.toUpperCase();
      var p = request.url;
      this._getFunction(method, p).call(this, request, response);
    };

    proto.closeServer = function() {
    };

    proto._getFunction = function(method, p) {
      return routes[method][p] ||
        this._getStaticFile(p) ||
        this._getImageFile(p) ||
        routes.GET['/404-not-found'];
    };

    proto._getStaticFile = function(p) {
      p = path.join(__dirname, 'public', p);
      return this._getFile(p);
    };

    proto._getImageFile = function(p) {
      if (path.extname(p) !== '.png') {
        return false;
      }
      p = path.join(this.upload_dir, p);
      return this._getFile(p);
    };

    proto._getFile = function(p) {
      if (!path.existsSync(p)) {
        return false;
      }
      return function(request, response) {
        fs.readFile(p, function(err, data) {
          var ext = path.extname(p).slice(1);
          response.setHeader('Content-type', CONTENT_TYPES[ext]);
          response.end(data);
        });
      };
    };
  })(GyazoServer.prototype);
})();
