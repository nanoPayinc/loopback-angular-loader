/* global Environment:false */

'use strict';

angular.module('shared')

.factory(
  'ApplicationSockets', ['ApplicationSecurity', 'Sockets', '$rootScope',
  function(ApplicationSecurity, Sockets, $rootScope) {
    var connection;
    var connectionDtmf;

    var internal = {
      connect: function (callback) {
        var userId = ApplicationSecurity.userId();

        if (! userId) {
          console.log('not connected 1');
          callback(false);
        }

        Sockets.connect({
          'userId': userId
        }, function (data) {
          connection     = io.connect(Environment.getConfig('socketsUrl') + '/' + data.connectId);
          connectionDtmf = io.connect(Environment.getConfig('socketsUrl') + '/secure-voice');

          console.log('connected 1');

          $rootScope.$emit("ApplicationSockets.connected", true);
          callback(true);

        }, function () {
          console.log('not connected 2');
          callback(false);
        });
      },
      on: function(eventName, callback) {
        if (! connection) {
          $rootScope.$on("ApplicationSockets.connected", function() {
            console.log('added listener 6');
            connection.on(eventName, callback);
          });
        } else {
          console.log('added listener 2');
          connection.on(eventName, callback);
        }
      },
      onSecureVoice: function(eventName, callback) {
        if (! connectionDtmf) {
          $rootScope.$on("ApplicationSockets.connected", function() {
            console.log('added listener 5');
            connectionDtmf.on(eventName, callback);
          });
        } else {
          console.log('added listener 4');
          connectionDtmf.on(eventName, callback);
        }
      }
    };

    return internal;
}]);
