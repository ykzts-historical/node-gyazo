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
