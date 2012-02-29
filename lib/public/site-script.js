(function(global, window, document) {
  'use strict';

  if (!global.GyazoUploader) {
    return;
  }

  function SiteScript() {
    this.uploader = new GyazoUploader();
    this.dropArea = this.createDropArea();
    this.form = this.uploadFormSetup();
    this.viewRecentlyUploadedFiles();
  }

  (function(proto) {
    proto.uploadFile = function uploadFile(file, id) {
      var self = this;
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
      imagedata.setAttribute('accept', 'image/*');
      imagedata.setAttribute('multiple', true);
      imagedata.addEventListener('change', function() {
        var files = this.files;
        self.uploadFiles(toArray(files), gyazoid.value);
      }, false);
      return form;
    };

    proto.createDropArea = function createDropArea() {
      var self = this;
      var dropArea = document.querySelector('#imagedata + label');
      var labelMessage = dropArea.getElementsByTagName('output')[0];
      labelMessage.value = labelMessage.value + ' or PLEASE DROP FILES';
      if (/firefox/i.exec(window.navigator.userAgent)) {
        dropArea.addEventListener('click', function() {
          document.getElementById('imagedata').click();
        }, false);
      }
      dropArea.addEventListener('dragover', eventCanceller, false);
      dropArea.addEventListener('dragenter', eventCanceller, false);
      dropArea.addEventListener('drop', eventCanceller(function(event) {
        var files = event.dataTransfer.files;
        var id = document.getElementById('gyazo-id').value;
        self.uploadFiles(toArray(files), id);
      }), false);
      return dropArea;
    };

    proto.setToResult = function setToResult(uri) {
      var imgElement = document.createElement('img');
      imgElement.addEventListener('load', function() {
        var result = document.getElementById('uploaded-files') || function() {
          var result = document.createElement('ol');
          document.getElementsByTagName('body')[0].appendChild(result);
          result.setAttribute('id', 'uploaded-files');
          return result;
        }();
        var item = document.createElement('li');
        item.appendChild(this);
        result.insertBefore(item, result.firstChild);
      }, false);
      imgElement.setAttribute('src', uri);
      imgElement.setAttribute('alt', uri);
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
