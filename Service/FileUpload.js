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
          url : options.uploadURL
        }); 

        // FILTERS
        uploader.filters.push({
          name: 'imageFilter',
          fn: function(item /*{File|FileLikeObject}*/) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
          }
        });
        
        uploader.filters.push({
          name: 'CSVFilter',
          fn: function(item /*{File|FileLikeObject}*/) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|csv|'.indexOf(type) !== -1;
          }
        });

        uploader.queueLimit = 1;

        // CALLBACKS
        uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
          console.log(options);
          if (options.onWhenAddingFileFailed) {
            options.onWhenAddingFileFailed({
              "item":item,
              "filter":filter,
              "options":options
            });
          }
          else {
            console.info('onWhenAddingFileFailed', item, filter, options); 
          }
        }; 
        uploader.onAfterAddingFile = function(fileItem) {
          if (options.onAfterAddingFile) {
            options.onAfterAddingFile({
              "fileItem":fileItem
            });
          }
          else {
            console.info('onAfterAddingFile', fileItem); 
          }
        }; 
        uploader.onAfterAddingAll = function(addedFileItems) {
          if (options.onAfterAddingAll) {
            options.onAfterAddingAll({
              "addedFileItems":addedFileItems
            });
          }
          else {
            console.info('onAfterAddingAll', addedFileItems); 
          }
        };
        uploader.onBeforeUploadItem = function(item) {
          if (options.onBeforeUploadItem) {
            options.onBeforeUploadItem({
              "item":item
            });
          }
          else {
            console.info('onBeforeUploadItem', item); 
          }
        };
        uploader.onProgressItem = function(fileItem, progress) {
          if (options.onProgressItem) {
            options.onProgressItem({
              "fileItem":fileItem,
              "progress":progress
            });
          }
          else {
            console.info('onProgressItem', fileItem, progress);
          }
        };
        uploader.onProgressAll = function(progress) {
          if (options.onProgressAll) {
            options.onProgressAll({
              "progress":progress
            });
          }
          else {
            console.info('onProgressAll', progress); 
          }
        };
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
          if (options.onSuccessItem) {
            options.onSuccessItem({
              "fileItem":fileItem,
              "response":response,
              "status":status,
              "headers":headers
            });
          }
          else {
            console.info('onSuccessItem', fileItem, response, status, headers); 
          }
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
          if (options.onErrorItem) {
            options.onErrorItem({
              "fileItem":fileItem,
              "response":response,
              "status":status,
              "headers":headers
            });
          }
          else {
            console.info('onErrorItem', fileItem, response, status, headers); 
          }
        }; 
        uploader.onCancelItem = function(fileItem, response, status, headers) {
          if (options.onCancelItem) {
            options.onCancelItem({
              "fileItem":fileItem,
              "response":response,
              "status":status,
              "headers":headers
            });
          }
          else {
             console.info('onCancelItem', fileItem, response, status, headers); 
          }
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
          if (options.onCompleteItem) {
            options.onCompleteItem({
              "fileItem":fileItem,
              "response":response,
              "status":status,
              "headers":headers
            });
          }
          else {
             console.info('onCompleteItem', fileItem, response, status, headers); 
          }
        };
        uploader.onCompleteAll = function() {
          if (options.onCompleteAll) {
            uploader.onCompleteAll = options.onCompleteAll();
          }
          else {
            if (options.redirectOnSuccess) {
              window.location = options.redirectOnSuccess;
            } 
          }
        }; 
      },
      upload: function($scope, targetUrl) {
        if ($scope.uploader.queue.length < 1) {
          return false;
        }
        
        if (targetUrl) {
          // set upload URL dynamically
          $scope.uploader.queue[0].url = targetUrl;
        }
 
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
