(function() {
  'use strict';

  var util = require('util');
  var formidable = require('formidable');

  function IncomingForm() {
    formidable.IncomingForm.call(this);
  }
  util.inherits(IncomingForm, formidable.IncomingForm);
  module.exports = IncomingForm;

  IncomingForm.prototype.onPart = function(part) {
    if (!part.filename) {
      this.handlePart(part);
      return;
    }
    var self = this;
    var buffers = [];
    var length = 0;
    part.on('data', function(chunk) {
      buffers.push(chunk);
      length += chunk.length;
    });
    part.on('end', function() {
      var buffer = buffers.reduceRight(function(previousBuffer, currentBuffer) {
        length -= currentBuffer.length;
        currentBuffer.copy(previousBuffer, length);
        return previousBuffer;
      }, new Buffer(length));
      self.emit('file', part.name, buffer);
    });
  };
})();
