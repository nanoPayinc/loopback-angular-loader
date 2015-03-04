/* global Environment:false */

'use strict';

angular.module('shared')

.factory(
  'ApplicationSockets', ['ApplicationSecurity', 'Sockets', '$rootScope', '$interval',
  function(ApplicationSecurity, Sockets, $rootScope, $interval) {
    var connection;
    var selectedRoom;
    var isConnected              = false;
    var updatedDate, currentDate = new Date();

    var internal = function () {
      this.connection     = false;
      this.addedListeners = {};
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

    internal.prototype.on = function (eventName, callback) {
      var self = this;

      if (this.addedListeners[eventName]) {
        return this;
      } else {
        this.addedListeners[eventName] = true;
      }

      if (! this.connection) {
        $rootScope.$on("ApplicationSockets.connected", function() {
          this.connection.on(eventName, callback);
        });
      } else {
        this.connection.on(eventName, callback);
      }

      return this;
    }

    internal.prototype.emit = function (eventName, data) {
      var self = this;

      if (! this.connection) {
        $rootScope.$on("ApplicationSockets.connected", function() {
          this.connection.emit(eventName, data);
        });
      } else {
        this.connection.emit(eventName, data);
      }

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

        if (ApplicationSecurity.userId()) {
          console.log('Reconnecting to sockets');

          engine.connect(function (data) {}, true);
        }
      }
    }, 2000);

    return engine;
}]);
