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
          if (options.redirectOnSuccess) {
            window.location = options.redirectOnSuccess;
          }
        };
      },
      upload: function($scope, targetId) {
        if ($scope.uploader.queue.length < 1) {
          return false;
        }

        $scope.uploader.formData[0].targetId          = targetId;
        $scope.uploader.queue[0].formData[0].targetId = targetId;

        $scope.uploader.uploadAll();

        return true;
      }
    };
  }])
  .directive('ngThumb', ['$window', function($window) {
    var helper = {
      support: !!($window.FileReader && $window.CanvasRenderingContext2D),
      isFile: function(item) {
        return angular.isObject(item) && item instanceof $window.File;
      },
      isImage: function(file) {
        var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    };

    return {
      restrict: 'A',
      template: '<canvas/>',
      link: function(scope, element, attributes) {
        if (!helper.support) {
          return;
        }

        var params = scope.$eval(attributes.ngThumb);

        if (!helper.isFile(params.file)) {
          return;
        }
        if (!helper.isImage(params.file)) {
          return;
        }

        var canvas = element.find('canvas');
        var reader = new FileReader();

        reader.onload = onLoadFile;
        reader.readAsDataURL(params.file);

        function onLoadFile(event) {
          var img = new Image();
          img.onload = onLoadImage;
          img.src = event.target.result;
        }

        function onLoadImage() {
          var width  = params.width || this.width / this.height * params.height;
          var height = params.height || this.height / this.width * params.width;

          canvas.attr({ width: width, height: height });
          canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
        }
      }
    };
  }]);
