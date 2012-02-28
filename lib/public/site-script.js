(function(global, window, document) {
  'use strict';

  if (!global.GyazoUploader) {
    return;
  }

  function SiteScript() {
    this.uploader = new GyazoUploader();
    this.dropArea = this.createDropArea();
    this.uploadFormSetup();
    this.viewRecentlyUploadedFiles();
  }

  (function(proto) {
    proto.setToResult = function setToResult(uri) {
      var result = document.getElementById('uploaded-files') || function() {
        var result = document.createElement('ol');
        document.getElementsByTagName('body')[0].appendChild(result);
        result.setAttribute('id', 'uploaded-files');
        return result;
      }();
      var item = document.createElement('li');
      var imgElement = document.createElement('img');
      imgElement.addEventListener('load', function() {
        item.appendChild(this);
        result.insertBefore(item, result.firstChild);
      }, false);
      imgElement.setAttribute('src', uri);
      imgElement.setAttribute('alt', uri);
    };

    proto.uploadFile = function uploadFile(file, id) {
      var self = this;
      if (id) {
        this.uploader.id = id;
      }
      this.uploader.upload(file, function(err, uri) {
        if (err) {
          console.log(file.name + ' is upload failed.');
          return;
        }
        var json = localStorage.getItem('uploaded-files');
        var uploadedFiles = JSON.parse(json || '[]');
        uploadedFiles.push(uri);
        self.setToResult(uri);
        json = JSON.stringify(uploadedFiles);
        localStorage.setItem('uploaded-files', json);
      });
    };

    proto.uploadFiles = function uploadFiles(files, id) {
      var self = this;
      files.forEach(function(file) {
        self.uploadFile(file, id);
      });
    };

    proto.uploadFormSetup = function uploadFormSetup() {
      var self = this;
      var form = document.getElementById('gyazo-upload');
      var gyazoid = document.getElementById('gyazo-id');
      var imagedata = document.getElementById('imagedata');
      form.removeChild(form.getElementsByTagName('menu')[0]);
      form.addEventListener('submit', eventCanceller, false);
      gyazoid.value = localStorage.getItem('gyazo-id') || '';
      gyazoid.addEventListener('input', function() {
        localStorage.setItem('gyazo-id', this.value);
      }, false);
      imagedata.addEventListener('change', function() {
        var files = this.files;
        self.uploadFiles(toArray(files), gyazoid.value);
      }, false);
    };

    proto.createDropArea = function createDropArea() {
      var self = this;
      var dropArea = document.querySelector('#imagedata + label');
      dropArea.textContent = dropArea.textContent + ' or PLEASE DROP FILES';
      dropArea.addEventListener('dragover', eventCanceller, false);
      dropArea.addEventListener('dragenter', eventCanceller, false);
      dropArea.addEventListener('drop', eventCanceller(function(event) {
        var files = event.dataTransfer.files;
        var id = document.getElementById('gyazo-id').value;
        self.uploadFiles(toArray(files), id);
      }), false);
      return dropArea;
    };

    proto.viewRecentlyUploadedFiles = function viewRecentlyUploadedFiles() {
      var self = this;
      var json = localStorage.getItem('uploaded-files');
      var uploadedFiles = JSON.parse(json || '[]');
      uploadedFiles.slice(uploadedFiles.length-3).forEach(function(uri) {
        self.setToResult(uri);
      });
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

  window.addEventListener('DOMContentLoaded', function() {
    new SiteScript();
  }, false);
})(this, window, window.document);
