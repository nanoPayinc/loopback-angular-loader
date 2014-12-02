/* global Environment:false */

'use strict';

angular.module('shared')

.factory(
  'ApplicationSockets', ['ApplicationSecurity', 'Sockets',
  function(ApplicationSecurity, Sockets) {
    var connection;

    var internal = {
      connect: function () {
        var userId = ApplicationSecurity.userId();

        if (! userId) {
          return;
        }

        Sockets.connect({
          'userId': userId
        }, function (data) {
          connection = io.connect('http://localhost:10843/' + data.connectId);

          return true;
        }, function (err) {
          return;
        });
      },
      on: function(eventName, callback) {
        if (! connection) {
          this.connect();
        }

        connection.on(eventName, callback);
      }
    };

    return internal;
}]);
