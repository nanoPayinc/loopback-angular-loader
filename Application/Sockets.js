/* global Environment:false */

'use strict';

angular.module('shared')

.factory(
  'ApplicationSockets', ['ApplicationSecurity', 'Sockets', '$rootScope', '$log', '$interval',
  function(ApplicationSecurity, Sockets, $rootScope, $log, $interval) {
    var connection;
    var selectedRoom;
    var updatedDate, currentDate = new Date();

    var internal = function () {
      this.room       = false;
      this.connection = false;
    }

    internal.prototype.connect = function (callback, reconnect) {
      var self = this;
      var userId = ApplicationSecurity.userId();

      if (! userId) {
        callback(false);
      }

      Sockets.connect({
        'userId': userId
      }, function (data) {
        if(self.connection) {
          self.connection.disconnect();
          self.connection.connect();
        } else {
          self.connection = io.connect(Environment.getConfig('socketsUrl') + '/' + userId, {'reconnection': false});
        }

        console.log('Connected to sockets: ', userId);

        if (! reconnect) {
          $rootScope.$emit("ApplicationSockets.connected", true);
        }

        callback(true);
      }, function () {
        callback(false);
      });
    }

    internal.prototype.directOn = function (eventName, callback) {
      if (this.room) {
        this.connection.on(eventName, callback);
      }

      this.connection.on(eventName, callback);
    }

    internal.prototype.on = function (eventName, callback) {
      var self = this;

      if (! this.connection) {
        $rootScope.$on("ApplicationSockets.connected", function() {
          self.directOn(eventName, callback);
        });
      } else {
        self.directOn(eventName, callback);
      }

      this.room = false;

      return this;
    }

    internal.prototype.in = function (room) {
      this.room = room;

      return this;
    }

    internal.prototype.directEmit = function (eventName, data) {
      if (this.room) {
        this.connection.emit(eventName, data);
      }

      this.connection.emit(eventName, data);
    }

    internal.prototype.emit = function (eventName, data) {
      var self = this;

      if (! this.connection) {
        $rootScope.$on("ApplicationSockets.connected", function() {
          self.directEmit(eventName, data);
        });
      } else {
        self.directEmit(eventName, data);
      }

      this.room = false;

      return this;
    }

    $log.info('Initialized');

    var engine = new internal;

    $rootScope.$on('ApplicationSockets.connected', function () {
        engine.connection.on('sockets.connected', function (data) {
          console.log('received server update');
          updatedDate = new Date();
        });
    });

    $interval(function () {
      currentDate = new Date();

      if (! updatedDate) {
        updatedDate = new Date();
      }

      if (currentDate - updatedDate > 4000) {
        console.log('reconnecting');
        engine.connect(function () {
          console.log('reconnected');
        }, true);
      }
    }, 2000);

    return engine;
}]);
