/* global Environment:false */

'use strict';

angular.module('shared')

.factory(
  'ApplicationSockets', ['ApplicationSecurity', 'Sockets', '$rootScope', '$interval',
  function(ApplicationSecurity, Sockets, $rootScope, $interval) {
    var connection;
    var selectedRoom;
    var isConnected = false;
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
        if (self.connection) {
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

    var engine = new internal;

    $rootScope.$on('ApplicationSockets.connected', function () {
      engine.connection.on('sockets.connected', function (data) {
        isConnected = true;
        updatedDate = new Date();
      });
    });

    $interval(function () {
      currentDate = new Date();

      if (! updatedDate) {
        updatedDate = new Date();
      }

      if (currentDate - updatedDate > 4000) {
        isConnected = false;
        console.log('Disconnected from sockets');

        if (ApplicationSecurity.userId()) {
          console.log('Reconnecting to sockets');

          engine.connect(function (data) {}, true);
        }
      }
    }, 2000);

    return engine;
}]);
