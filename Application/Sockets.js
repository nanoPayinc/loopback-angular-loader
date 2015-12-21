/* global Environment:false */

'use strict';

angular.module('shared')

.factory(
  'ApplicationSockets', ['ApplicationSecurity', 'Sockets', '$rootScope',
  function(ApplicationSecurity, Sockets, $rootScope) {
    var connection;
    var selectedRoom;
    var isConnected = false;
    var updatedDate = new Date();

    var internal = function () {
      this.connection     = false;
      this.addedListeners = {};
    }

    internal.prototype.connect = function (callback) {
      var self = this;
      var user = ApplicationSecurity.user();

      if (!user.id) {
        if (callback) {
          callback(false);
        }
        return;
      }

      self.connection = io.connect(Environment.getConfig('socketsUrl') + '/' + user.id);

      self.connection.on('connect', function () {
        isConnected = true;
      });

      self.connection.on('error', function (err) {
        isConnected = false;

        if (err != 'Invalid namespace') {
          return;
        }

        ApplicationSecurity.logout();
      });

      if (!callback) {
        return;
      }

      callback(true);
    }

    internal.prototype.directOn = function (eventName, callback) {
      this.connection.on(eventName, callback);
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
          self.directOn(eventName, callback);
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

    engine.connect();

    return engine;
}]);
