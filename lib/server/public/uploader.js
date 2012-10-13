(function(global, document) {
  'use strict';

  function GyazoUploader(id) {
    this.id = id || '';
    this.end_point = '/upload.cgi';
  }
  global.GyazoUploader = GyazoUploader;

  (function(proto) {
    proto.upload = function upload(file, callback) {
      if (file.type === 'image/png') {
        this.uploadPng(file, callback);
        return;
      }
      this.transformImageToPng(file, function(err, png_file) {
        this.uploadPng(png_file, callback);
      }.bind(this));
    };

    proto.uploadPng = function uploadPng(file, callback) {
      var form_data = new FormData();
      var req = new XMLHttpRequest();
      form_data.append('id', this.id);
      form_data.append('imagedata', file);
      req.open('POST', this.end_point);
      req.addEventListener('load', function() {
        if (req.status !== 200) {
          callback.call(this, new Error('Upload failed.'), null);
          return;
        }
        var res = req.responseText;
        callback.call(this, null, res);
      }.bind(this), false);
      req.send(form_data);
    };

    proto.transformImageToPng = function transformImagePng(file, callback) {
      this.transformBlobToUri(file, function(err, uri) {
        this.transformImageUriToPngUri(uri, function(err, png_uri) {
          this.transformUriToBlob(png_uri, callback);
        }.bind(this));
      }.bind(this));
    };

    proto.transformImageUriToPngUri = function transformImageUriToPngUri(uri, callback) {
      var imageElement = document.createElement('img');
      var canvasElement = document.createElement('canvas');
      var context = canvasElement.getContext('2d');
      imageElement.addEventListener('load', function() {
        canvasElement.width = imageElement.width;
        canvasElement.height = imageElement.height;
        context.drawImage(imageElement, 0, 0);
        callback.call(this, null, canvasElement.toDataURL('image/png'));
      }.bind(this), false);
      imageElement.src = uri;
    };

    proto.transformBlobToUri = function transformBlobToUri(blob, callback) {
      callback(null, URL.createObjectURL(blob));
    };

    proto.transformUriToBlob = function transformUriToBlob(uri, callback) {
      var protocol = (/^(.+):/.exec(uri) || [null, 'http'])[1];
      if (protocol === 'data') {
        this.transformDataUriToBlob(uri, callback);
        return;
      }
      var req = new XMLHttpRequest();
      req.open('GET', uri);
      req.responseType = 'blob';
      req.addEventListener('load', function() {
        callback.call(this, req.response);
      }.bind(this), false);
      req.send(null);
    };

    proto.transformDataUriToBlob = function transformDataUriToBlob(uri, callback) {
      var protocol = 'data:';
      var searchValue = ';base64,';
      var index = uri.indexOf(searchValue);
      var contentType = uri.slice(protocol.length, index);
      var base64EncodedBlob = uri.slice(index+searchValue.length);
      var bytes = atob(base64EncodedBlob);
      var abuf = new ArrayBuffer(bytes.length);
      var u8a = new Uint8Array(abuf);
      var blob;
      for (var i=0; i<bytes.length; i++) {
        u8a[i] = bytes.charCodeAt(i);
      }
      blob = new Blob([u8a.buffer], {type: contentType});
      callback.call(this, null, blob);
    };
  })(GyazoUploader.prototype);
})(this, window.document);
