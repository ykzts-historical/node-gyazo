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
(function(global) {
  'use strict';

  var window = global.window;

  function SiteScript(window) {
    this.window = window;
    this.document = window.document;
    this.uploader = new GyazoUploader({context: window.document});
    this.dropArea = this.createDropArea();
    this.form = this.uploadFormSetup();
    this.viewRecentlyUploadedFiles();
  }

  (function(proto) {
    proto.uploadFile = function uploadFile(file, id) {
      if (id) {
        this.uploader.id = id;
      }
      this.uploader.upload(file, function(err, uri) {
        if (err) {
          alert(file.name + ' is upload failed.');
          return;
        }
        var json = localStorage.getItem('uploaded-files');
        var uploadedFiles = JSON.parse(json || '[]');
        uploadedFiles.push(uri);
        this.setToResult(uri);
        json = JSON.stringify(uploadedFiles);
        localStorage.setItem('uploaded-files', json);
      }.bind(this));
    };

    proto.uploadFiles = function uploadFiles(files, id) {
      files.forEach(function(file) {
        this.uploadFile(file, id);
      }.bind(this));
    };

    proto.uploadFormSetup = function uploadFormSetup() {
      var form = this.document.getElementById('gyazo-upload');
      var gyazoid = this.document.getElementById('gyazo-id');
      var imagedata = this.document.getElementById('imagedata');
      form.removeChild(form.getElementsByTagName('menu')[0]);
      form.addEventListener('submit', eventCanceller, false);
      gyazoid.value = localStorage.getItem('gyazo-id') || '';
      gyazoid.addEventListener('input', function() {
        localStorage.setItem('gyazo-id', this.value);
      }, false);
      imagedata.setAttribute('accept', 'image/*');
      imagedata.setAttribute('multiple', true);
      imagedata.addEventListener('change', function(event) {
        var files = event.target.files;
        this.uploadFiles(toArray(files), gyazoid.value);
      }.bind(this), false);
      return form;
    };

    proto.createDropArea = function createDropArea() {
      var dropArea = this.document.querySelector('#imagedata + label');
      var labelMessage = dropArea.getElementsByTagName('output')[0];
      labelMessage.value = labelMessage.value + ' or PLEASE DROP FILES';
      if (/firefox/i.exec(this.window.navigator.userAgent)) {
        dropArea.addEventListener('click', function() {
          this.document.getElementById('imagedata').click();
        }.bind(this), false);
      }
      dropArea.addEventListener('dragover', eventCanceller, false);
      dropArea.addEventListener('dragenter', eventCanceller, false);
      dropArea.addEventListener('drop', eventCanceller(function(event) {
        var files = event.dataTransfer.files;
        var id = this.document.getElementById('gyazo-id').value;
        this.uploadFiles(toArray(files), id);
      }.bind(this)), false);
      return dropArea;
    };

    proto.setToResult = function setToResult(uri) {
      var imgElement = this.document.createElement('img');
      imgElement.addEventListener('load', function() {
        var result = this.document.getElementById('uploaded-files') || (function() {
          var result = this.document.createElement('ol');
          this.document.getElementsByTagName('body')[0].appendChild(result);
          result.setAttribute('id', 'uploaded-files');
          return result;
        }).call(this);
        var item = this.document.createElement('li');
        item.appendChild(imgElement);
        result.insertBefore(item, result.firstChild);
      }.bind(this), false);
      imgElement.setAttribute('src', uri);
      imgElement.setAttribute('alt', uri);
    };

    proto.viewRecentlyUploadedFiles = function viewRecentlyUploadedFiles() {
      var json = localStorage.getItem('uploaded-files');
      var uploadedFiles = JSON.parse(json || '[]');
      uploadedFiles.slice(uploadedFiles.length-3).forEach(function(uri) {
        this.setToResult(uri);
      }.bind(this));
    };
  })(SiteScript.prototype);

  function toArray(obj) {
    return Array.prototype.slice.call(obj);
  }

  function eventCanceller() {
    var arg = arguments[0], event, func;
    if (typeof arg === 'function') {
      func = arg;
      return function(event) {
        event.preventDefault();
        func.call(this, event);
        return false;
      };
    }
    event = arg;
    event.preventDefault();
    return false;
  }

  function main() {
    window.addEventListener('DOMContentLoaded', function() {
      new SiteScript(window);
    }, false);
  }

  if (global === window) {
    main();
  }
})(this);
