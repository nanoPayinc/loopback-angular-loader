/* global Environment:false */

'use strict';

angular.module('shared')
  .config(['LoopBackResourceProvider', function(LoopBackResourceProvider) {
    LoopBackResourceProvider.setUrlBase(Environment.getConfig('apiUrl'));
  }])
  .factory('ApplicationLoader', [
    'ApplicationSecurity', 'ApplicationSockets',
    function(ApplicationSecurity, ApplicationSockets) {
      var currentState;

      return {
        getConfig: function(id) {
          return Environment.getConfig(id);
        },
        configure: function() {},
        start: function(state, options) {
          currentState = state;

          var preloadUserPromise = ApplicationSecurity.preloadUser();

          if (options && options.sockets) {
            preloadUserPromise.then(function () {
              ApplicationSockets.connect(function (isConnected) {
                console.log('connected to sockets: ' + isConnected);
              });
            });

            return preloadUserPromise;
          } else {
            return preloadUserPromise;
          }
        },
        updateState: function(state) {
          currentState = state;
        },
        getState: function() {
          return currentState;
        }
      };
    }
  ]);
