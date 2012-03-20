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
