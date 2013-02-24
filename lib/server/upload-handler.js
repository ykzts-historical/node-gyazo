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

  var path = require('path');
  var fs = require('fs');
  var url = require('url');
  var crypto = require('crypto');
  var IncomingForm = require('./incoming-form');

  function uploadHandler(request, response) {
    var self = this;
    var form = new IncomingForm();
    form.parse(request, function(err, fields, files) {
      var id = fields.id || '';
      if (self.required_id && self.required_id !== id) {
        request.method = 'GET';
        request.url = '/402-payment-required';
        self.receiveRequest(request, response);
        return;
      };
      var imagedata = files.imagedata;
      if (!imagedata.length) {
        request.method = 'GET';
        request.url = '/404-not-found';
        self.receiveRequest(request, response);
        return;
      }
      var hash = crypto.createHash('md5').update(imagedata).digest('hex');
      var filename = hash + '.png';
      fs.writeFile(path.join(self.upload_dir, filename), imagedata, function(err) {
        response.setHeader('Content-type', 'text/plain');
        response.setHeader('Cache-control', 'no-cache');
        response.end(url.format({
          protocol: 'http',
          host: request.headers.host,
          pathname: '/' + filename
        }));
      });
    });
  };

  module.exports = uploadHandler;
})();
