(function(window, document) {
  'use strict';

  var BlobBuilder = window.BlobBuilder ||
    window.WebKitBlobBuilder || window.MozBlobBuilder || null;
  var URL = window.URL ||
    window.webkitURL || window.mozURL || null;

  function GyazoUploader(id) {
    this.id = id;
  };

  (function(proto) {
    proto.upload = function(file) {
      var self = this;
      if (file.type === 'image/png') {
        self.uploadPNG(file);
        return;
      }
      self.transformImageToPNG(file, function(png_file) {
        self.uploadPNG(png_file);
      });
    };

    proto.uploadPNG = function(file) {
      var form_data = new FormData();
      var req = new XMLHttpRequest();
      form_data.append('id', this.id);
      form_data.append('imagedata', file);
      req.addEventListener('load', function() {
        var res = req.responseText;
        alert(res);
      }, false);
      req.open('POST', '/upload.cgi');
      req.send(form_data);
    };

    proto.transformImageToPNG = function(file, callback) {
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
      imageElement.onload = function() {
        canvasElement.width = imageElement.width;
        canvasElement.height = imageElement.height;
        context.drawImage(imageElement, 0, 0);
        callback(canvasElement.toDataURL('image/png'));
      };
      imageElement.src = uri;
    };

    proto.transformBlobToUri = function(blob, callback) {
      callback(URL.createObjectURL(blob));
    };

    proto.transformUriToBlob = function(uri, callback) {
      var bb = new BlobBuilder();
      var bytes = atob(uri.replace(/^data:image\/png;base64,/, ''));
      var abuf = new ArrayBuffer(bytes.length);
      var u8a = new Uint8Array(abuf);
      for (var i=0; i<bytes.length; i++) {
        u8a[i] = bytes.charCodeAt(i);
      }
      bb.append(u8a.buffer);
      callback(bb.getBlob('image/png'));
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