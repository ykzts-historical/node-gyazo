(function(window, document) {
  'use strict';

  var BlobBuilder = window.BlobBuilder ||
    window.WebKitBlobBuilder || window.MozBlobBuilder || null;
  var URL = window.URL ||
    window.webkitURL || window.mozURL || null;

  function GyazoUploader(id) {
    this.id = id || null;
  };

  (function(proto) {
    proto.upload = function(file) {
      var self = this;
      if (file.type === 'image/png') {
        self.uploadPng(file);
        return;
      }
      self.transformImageToPng(file, function(png_file) {
        self.uploadPng(png_file);
      });
    };

    proto.uploadPng = function(file) {
      var form_data = new FormData();
      var req = new XMLHttpRequest();
      form_data.append('id', this.id);
      form_data.append('imagedata', file);
      req.open('POST', '/upload.cgi');
      req.addEventListener('load', function() {
        var res = req.responseText;
        alert(res);
      }, false);
      req.send(form_data);
    };

    proto.transformImageToPng = function(file, callback) {
      var self = this;
      this.transformBlobToUri(file, function(uri) {
        self.transformImageUriToPngUri(uri, function(png_uri) {
          self.transformUriToBlob(png_uri, callback);
        });
      });
    };

    proto.transformImageUriToPngUri = function(uri, callback) {
      var imageElement = new Image();
      var canvasElement = document.createElement('canvas');
      var context = canvasElement.getContext('2d');
      imageElement.addEventListener('load', function() {
        canvasElement.width = imageElement.width;
        canvasElement.height = imageElement.height;
        context.drawImage(imageElement, 0, 0);
        callback(canvasElement.toDataURL('image/png'));
      }, false);
      imageElement.src = uri;
    };

    proto.transformBlobToUri = function(blob, callback) {
      callback(URL.createObjectURL(blob));
    };

    proto.transformUriToBlob = function(uri, callback) {
      var protocol = (/^(.+):/.exec(uri) || [null, 'http'])[1];
      if (protocol === 'data') {
        this.transformDataUriToBlob(uri, callback);
        return;
      }
      var req = new XMLHttpRequest();
      req.open('GET', uri);
      req.responseType = 'blob';
      req.addEventListener('load', function() {
        callback(req.response);
      }, false);
      req.send(null);
    };

    proto.transformDataUriToBlob = function(uri, callback) {
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
      callback(bb.getBlob(contentType));
    };
  })(GyazoUploader.prototype);

  window.addEventListener('DOMContentLoaded', function() {
    var uploader = new GyazoUploader(localStorage.gyazoID);
    var bodyElement = document.getElementsByTagName('body')[0];
    var formElement = document.getElementsByTagName('form')[0];
    var dropArea = document.createElement('p');
    bodyElement.appendChild(dropArea);
    dropArea.setAttribute('id', 'drop-area');
    dropArea.textContent = 'please drop image.';
    formElement.addEventListener('submit', function(event) {
      event.preventDefault();
      var files = document.getElementById('imagedata').files;
      toArray(files).forEach(uploader.upload, uploader);
      return false;
    }, false);
    dropArea.addEventListener('dragover', function(event) {
      event.preventDefault();
      return false;
    }, false);
    dropArea.addEventListener('dragenter', function(event) {
      event.preventDefault();
      return false;
    }, false);
    dropArea.addEventListener('drop', function(event) {
      event.preventDefault();
      var files = event.dataTransfer.files;
      toArray(files).forEach(uploader.upload, uploader);
      return false;
    }, false);
  }, false);

  function toArray(obj) {
    return Array.prototype.slice.apply(obj);
  }
})(window, window.document);
