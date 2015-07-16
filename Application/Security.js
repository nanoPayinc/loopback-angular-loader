/* global Environment:false */

'use strict';

angular.module('shared')

.factory(
  'ApplicationSecurity', ['$rootScope', 'LoopBackAuth', 'User', '$q', '$window', '$cookies',
  function($rootScope, LoopBackAuth, User, $q, $window, $cookies) {
    var currentUser = {};

    var internal = {
      user: function() {
        return currentUser;
      },
      isAuthenticated: function () {
        return LoopBackAuth.currentUserId; /// !!! refactor to use boolean value
      },
      userId: function () {
        return LoopBackAuth.currentUserId;
      },
      accessToken: function() {
        return LoopBackAuth.accessTokenId;
      },
      isAdmin: function () {
        return LoopBackAuth.isAdmin || false;
      },
      logout: function(callback, options) {
        if (! options) {
          options = {};
        }

        if (typeof callback === 'undefined' || !callback) {
          callback = function(){};
        }

        var self = this;

        User.logout(false,
          function() {
            self.clearUser();
            
            if (typeof options.logoutRedirect !== "undefined" && options.loginRedirect === false) {
              return;
            }

            window.location = options.logoutRedirect || Environment.getConfig('logoutRedirect');

            callback(false, true);
          },
          function(res) {
            self.clearUser();
            
            if (typeof options.logoutRedirect !== "undefined" && options.loginRedirect === false) {
              return;
            }

            window.location = options.logoutRedirect || Environment.getConfig('logoutRedirect');

            callback(res.data.error);
          }
        );
      },
      loginByToken: function (userData, callback) {
        var accessToken = userData.userData;

        LoopBackAuth.setUser(accessToken.id, accessToken.userId, false);
        LoopBackAuth.rememberMe = true;
        LoopBackAuth.save();

        User.findById(
          {
            'id' : accessToken.userId
          },
          function(user) {
            LoopBackAuth.setUser(accessToken.id, accessToken.userId, user);
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
      login: function(userData, callback, options) {
        if (! options) {
          options = {};
        }

        User.login(userData,
          function(data) {
            User.findById(
              {
                'id' : data.userId
              },
              function(user) {
                LoopBackAuth.isAdmin = user.isAdmin;
                
                var expiration = Date.now() + (data.ttl * 1000);
                $cookies.putObject(Environment.getConfig('cookieName'), {
                  id:data.id,
                  expiration:expiration
                });

                currentUser = user;

                callback(false, user);
                
                if (typeof options.loginRedirect !== "undefined" && options.loginRedirect === false) {
                  return;
                }

                window.location = options.loginRedirect || Environment.getConfig('loginRedirect');
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
          if ($cookies.getObject(Environment.getConfig('cookieName')) && 
            new Date($cookies.getObject(Environment.getConfig('cookieName')).expiration) < Date.now() && 
            $window.location.pathname !== Environment.getConfig('logoutRedirect')) {
            // expired cookie, redirect to logout page
              $window.location = Environment.getConfig('logoutRedirect') + '#/redirect/loginRequired';
          }
          else if (self.isAuthenticated()) {
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
