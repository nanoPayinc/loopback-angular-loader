/* global Environment:false */

'use strict';

angular.module('shared')

.factory('ApplicationSecurity', ['$rootScope', 'LoopBackAuth', 'User', '$q', '$window', function($rootScope, LoopBackAuth, User, $q, $window) {
  var currentUser = {};

  var internal = {
    user: function() {
      return currentUser;
    },
    isAuthenticated: function () {
      return LoopBackAuth.currentUserId;
    },
    userId: function () {
      return LoopBackAuth.currentUserId;
    },
    isAdmin: function () {
      return LoopBackAuth.isAdmin || false;
    },
    logout: function(callback) {
      if (typeof callback === 'undefined') {
        callback = function(){};
      }

      var self = this;

      User.logout(false,
        function() {
          self.clearUser();

          window.location = Environment.getConfig('logoutRedirect');

          callback(false, true);
        },
        function(res) {
          self.clearUser();

          window.location = Environment.getConfig('logoutRedirect');

          callback(res.data.error);
        }
      );
    },
    login: function(userData, callback) {
      User.login(userData,
        function(data) {
          User.findById(
            {
              'id' : data.userId
            },
            function(user) {
              LoopBackAuth.isAdmin = user.isAdmin;

              currentUser = user;

              callback(false, user);

              window.location = Environment.getConfig('loginRedirect');
            },
            function (res) {
              callback(res);
            }
          );
        },
        function(res) {
          callback(res.data.error);
        }
      );
    },
    clearUser: function() {
      currentUser = false;

      LoopBackAuth.clearUser();
      LoopBackAuth.isAdmin = false;
      LoopBackAuth.rememberMe = true; // Cleaning local storage
      LoopBackAuth.save();

      LoopBackAuth.rememberMe = false; // Cleaning session storage
      LoopBackAuth.save();
    },
    preloadUser: function() {
      var self = this;

      return $q(function(resolve, reject) {
        if (self.isAuthenticated()) {
          User.findById(
            {
              'id': self.isAuthenticated()
            },
            function(user) {
              LoopBackAuth.isAdmin = user.isAdmin;

              currentUser = user;

              resolve(user);
            },
            function (res) {
              self.clearUser();

              reject(res);
            }
          );
        } else {
          User.getFromSession(function (data) {
            if (data.accessToken && data.accessToken.id) {
              User.findById(
                {
                  'id': data.accessToken.userId
                },
                function(user) {
                  LoopBackAuth.isAdmin = user.isAdmin;

                  LoopBackAuth.setUser(data.accessToken.id, data.accessToken.userId, user);
                  LoopBackAuth.save();

                  $window.location.reload();

                  resolve(user);
                },
                function (res) {
                  self.clearUser();

                  reject(res);
                }
              );
            } else {
              reject('empty session data');
            }
          });
        }
      });
    }
  };

  $rootScope.ApplicationSecurity = internal;

  return internal;
}]);
