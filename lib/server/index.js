/**
 * Copyright (c) 2012-2013 Yamagishi Kazutoshi
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
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
      if (!fs.existsSync(p)) {
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
