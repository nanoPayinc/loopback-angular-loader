/* global Environment:false */

'use strict';

angular.module('shared')

.factory(
  'ApplicationSockets', ['ApplicationSecurity', 'Sockets',
  function(ApplicationSecurity, Sockets) {
    var connection;
    var connectionDtmf;

    var internal = {
      connect: function () {
        var userId = ApplicationSecurity.userId();

        if (! userId) {
          return;
        }

        Sockets.connect({
          'userId': userId
        }, function (data) {
          connection     = io.connect(Environment.getConfig('socketsUrl') + '/' + data.connectId);
          connectionDtmf = io.connect(Environment.getConfig('socketsUrl') + '/secure-voice');

          return true;
        }, function () {
          return;
        });
      },
      on: function(eventName, callback) {
        if (! connection) {
          this.connect();
        }

        connection.on(eventName, callback);
      },
      onSecureVoice: function(eventName, callback) {
        if (! connectionDtmf) {
          this.connectionDtmf();
        }

        connectionDtmf.on(eventName, callback);
      }
    };

    return internal;
}]);
