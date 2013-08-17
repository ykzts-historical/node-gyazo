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

  function SiteScript(window) {
    this.window = window;
    this.uploader = new GyazoUploader({context: window.document});
    window.addEventListener('DOMContentLoaded', this, false);
  }

  (function(proto) {
    proto.contentLoaded = function contentLoaded(event) {
      var document = event.target;
      var dropArea = this.createDropArea(document);
      var form = this.uploadFormSetup(document);
      dropArea.addEventListener('dragover', this, false);
      dropArea.addEventListener('dragenter', this, false);
      dropArea.addEventListener('drop', this, false);
      this.viewRecentlyUploadedFiles();
    };

    proto.createDropArea = function createDropArea(document) {
      var dropArea = document.querySelector('#imagedata + label');
      var labelMessage = dropArea.getElementsByTagName('output')[0];
      labelMessage.value = labelMessage.value + ' or PLEASE DROP FILES';
      if (/firefox/i.exec(this.window.navigator.userAgent)) {
        dropArea.addEventListener('click', function() {
          this.document.getElementById('imagedata').click();
        }.bind(this), false);
      }
      return dropArea;
    };

    proto.dragAndDrop = function dragAndDrop(event) {
      var type = event.type;
      if (type === 'drop') {
        return dragAndDrop.drop.apply(this, arguments);
      }
      event.preventDefault();
      return false;
    };

    proto.dragAndDrop.drop = function drop(event) {
      var files = event.dataTransfer.files;
      var id = this.document.getElementById('gyazo-id').value;
      event.preventDefault();
      Array.prototype.forEach.call(files, function(file) {
        this.uploadFile(file, id);
      }, this);
      return false;
    };

    proto.handleEvent = function handleEvent(event) {
      var type = event.type;
      var listeners = handleEvent.listeners;
      var methodName = listeners[type];
      var method = this[methodName];
      if (typeof method !== 'function') {
        return;
      }
      return method.apply(this, arguments);
    };

    proto.handleEvent.listeners = {
      DOMContentLoaded: 'contentLoaded',
      dragenter: 'dragAndDrop',
      dragover: 'dragAndDrop',
      drop: 'dragAndDrop'
    };

    proto.setToResult = function setToResult(uri) {
      var document = this.window.document;
      var imgElement = document.createElement('img');
      imgElement.addEventListener('load', function() {
        var result = document.getElementById('uploaded-files') || (function() {
          var result = document.createElement('ol');
          document.getElementsByTagName('body')[0].appendChild(result);
          result.setAttribute('id', 'uploaded-files');
          return result;
        }).call(this);
        var item = document.createElement('li');
        item.appendChild(imgElement);
        result.insertBefore(item, result.firstChild);
      }, false);
      imgElement.setAttribute('src', uri);
      imgElement.setAttribute('alt', uri);
    };

    proto.uploadFile = function uploadFile(file, id) {
      this.uploader.id = id || '';
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

    proto.uploadFormSetup = function uploadFormSetup() {
      var form = document.getElementById('gyazo-upload');
      var gyazoid = document.getElementById('gyazo-id');
      var imagedata = document.getElementById('imagedata');
      form.removeChild(form.getElementsByTagName('menu')[0]);
      form.addEventListener('submit', function() {
        event.preventDefault();
        return false;
      }, false);
      gyazoid.value = localStorage.getItem('gyazo-id') || '';
      gyazoid.addEventListener('input', function() {
        localStorage.setItem('gyazo-id', this.value);
      }, false);
      imagedata.setAttribute('accept', 'image/*');
      imagedata.setAttribute('multiple', true);
      imagedata.addEventListener('change', function(event) {
        var files = event.target.files;
        Array.prototype.forEach.call(files, function(file) {
          this.uploadFile(file, gyazoid.value);
        }, this);
      }.bind(this), false);
      return form;
    };

    proto.viewRecentlyUploadedFiles = function viewRecentlyUploadedFiles() {
      var json = localStorage.getItem('uploaded-files');
      var uploadedFiles = JSON.parse(json || '[]');
      uploadedFiles.slice(uploadedFiles.length - 3).forEach(function(uri) {
        this.setToResult(uri);
      }.bind(this));
    };
  })(SiteScript.prototype);

  global.SiteScript = SiteScript;
})(this);
