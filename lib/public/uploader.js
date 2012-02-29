(function(global, document) {
  'use strict';

  var BlobBuilder = global.BlobBuilder || global.WebKitBlobBuilder || global.MozBlobBuilder || null;
  var URL = global.URL || global.webkitURL || global.mozURL || null;
  if (!(BlobBuilder && URL)) {
    return;
  }

  function GyazoUploader(id) {
    this.id = id || '';
    this.end_point = '/upload.cgi';
  }
  global.GyazoUploader = GyazoUploader;

  (function(proto) {
    proto.upload = function upload(file, callback) {
      var self = this;
      if (file.type === 'image/png') {
        self.uploadPng(file, callback);
        return;
      }
      self.transformImageToPng(file, function(err, png_file) {
        self.uploadPng(png_file, callback);
      });
    };

    proto.uploadPng = function uploadPng(file, callback) {
      var self = this;
      var form_data = new FormData();
      var req = new XMLHttpRequest();
      form_data.append('id', this.id);
      form_data.append('imagedata', file);
      req.open('POST', this.end_point);
      req.addEventListener('load', function() {
        if (req.status !== 200) {
          callback.call(self, new Error('Upload failed.'), null);
          return;
        }
        var res = req.responseText;
        callback.call(self, null, res);
      }, false);
      req.send(form_data);
    };

    proto.transformImageToPng = function transformImagePng(file, callback) {
      var self = this;
      this.transformBlobToUri(file, function(err, uri) {
        self.transformImageUriToPngUri(uri, function(err, png_uri) {
          self.transformUriToBlob(png_uri, callback);
        });
      });
    };

    proto.transformImageUriToPngUri = function transformImageUriToPngUri(uri, callback) {
      var self = this;
      var imageElement = document.createElement('img');
      var canvasElement = document.createElement('canvas');
      var context = canvasElement.getContext('2d');
      imageElement.addEventListener('load', function() {
        canvasElement.width = imageElement.width;
        canvasElement.height = imageElement.height;
        context.drawImage(imageElement, 0, 0);
        callback.call(self, null, canvasElement.toDataURL('image/png'));
      }, false);
      imageElement.src = uri;
    };

    proto.transformBlobToUri = function transformBlobToUri(blob, callback) {
      callback(null, URL.createObjectURL(blob));
    };

    proto.transformUriToBlob = function transformUriToBlob(uri, callback) {
      var self = this;
      var protocol = (/^(.+):/.exec(uri) || [null, 'http'])[1];
      if (protocol === 'data') {
        this.transformDataUriToBlob(uri, callback);
        return;
      }
      var req = new XMLHttpRequest();
      req.open('GET', uri);
      req.responseType = 'blob';
      req.addEventListener('load', function() {
        callback.call(self, req.response);
      }, false);
      req.send(null);
    };

    proto.transformDataUriToBlob = function transformDataUriToBlob(uri, callback) {
      var _ = /^data:(.+);base64,(.+)$/.exec(uri);
      var contentType = _[1];
      var base64EncodedBlob = _[2];
      var bytes = atob(base64EncodedBlob);
      var bb = new BlobBuilder();
      var abuf = new ArrayBuffer(bytes.length);
      var u8a = new Uint8Array(abuf);
      for (var i=0; i<bytes.length; i++) {
        u8a[i] = bytes.charCodeAt(i);
      }
      bb.append(u8a.buffer);
      callback.call(this, null, bb.getBlob(contentType));
    };
  })(GyazoUploader.prototype);
})(this, window.document);
