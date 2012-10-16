/**
 * Copyright (c) 2012 Yamagishi Kazutoshi
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

  var url = require('url');
  var uploadHandler = require('./upload-handler');

  var routes = {
    GET: {},
    POST: {}
  };

  routes.GET['/'] = function(request, response) {
    request.url = '/index.html';
    this.receiveRequest(request, response);
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

  routes.POST['/upload.cgi'] = uploadHandler;

  module.exports = routes;
})();
