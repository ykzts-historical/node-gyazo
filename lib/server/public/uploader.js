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
(function(global) {
  'use strict';

  function GyazoUploader(options) {
    options = options || {};
    this.context = options.context || null;
    this.id = options.id || '';
    this.end_point = options.end_point || '/upload.cgi';
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
      var imageElement = this.context.createElement('img');
      var canvasElement = this.context.createElement('canvas');
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
      if (typeof(URL) !== 'undefined' && typeof(URL.createObjectURL) === 'function') {
        callback(null, URL.createObjectURL(blob));
        return;
      }
      this.transformBlobToDataUri(blob, function(err, uri) {
        callback.call(this, null, uri);
      }.bind(this));
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
      var u8a = new Uint8Array(bytes.length);
      var blob;
      for (var i=0; i<bytes.length; i++) {
        u8a[i] = bytes.charCodeAt(i);
      }
      blob = new Blob([u8a], {type: contentType});
      callback.call(this, null, blob);
    };

    proto.transformBlobToDataUri = function transformBlobToDataUri(blob, callback) {
      var reader = new FileReader();
      reader.addEventListener('load', function() {
        callback(null, this.result);
      });
      reader.readAsDataURL(blob);
    };
  })(GyazoUploader.prototype);
})(this);
