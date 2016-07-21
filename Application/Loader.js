/* global Environment:false */

'use strict';

angular.module('shared')
  .config(['LoopBackResourceProvider', function(LoopBackResourceProvider) {
    LoopBackResourceProvider.setUrlBase(Environment.getConfig('apiUrl'));
  }])
  .factory('ApplicationLoader', [
    'ApplicationSecurity',
    function(ApplicationSecurity) {
      var currentState;

      return {
        getConfig: function(id) {
          return Environment.getConfig(id);
        },
        configure: function() {},
        start: function(state, options) {
          if (! options) {
            options = {};
          }

          currentState = state;

          var preloadUserPromise = ApplicationSecurity.preloadUser();
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
