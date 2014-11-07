/* global Environment:false */

'use strict';

angular.module('shared')
  .factory('FileUpload', ['FileUploader', function(FileUploader) {
    return {
      init: function($scope, options) {
        $scope.openFileInput = function() {
          document.getElementById(options.elementId).click();
        };

        var uploader = $scope.uploader = new FileUploader({
          scope: $scope,
          url : Environment.getConfig('apiUrl') + '/containers/' + options.containerId + '/upload',
          formData : [{
            componentId: options.componentId,
            componentClass: options.componentClass,
            targetId: ''
          }]
        });

        // FILTERS
        uploader.filters.push({
          name: 'imageFilter',
          fn: function(item /*{File|FileLikeObject}*/) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
          }
        });

        uploader.queueLimit = 1;

        // CALLBACKS
        uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
          console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function(fileItem) {
          console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function(addedFileItems) {
          console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function(item) {
          console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function(fileItem, progress) {
          console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function(progress) {
          console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
          console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
          console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function(fileItem, response, status, headers) {
          console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
          console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
          window.location = options.redirectOnSuccess;
        };
      },
      upload: function($scope, targetId) {
        if ($scope.uploader.queue.length < 1) {
          return false;
        }

        $scope.uploader.formData[0].targetId = targetId;
        $scope.uploader.queue[0].formData[0].targetId = targetId;

        $scope.uploader.uploadAll();

        return true;
      }
    };
  }]);
