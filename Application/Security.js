/* global Environment:false */

'use strict';

angular.module('shared')

.factory(
  'ApplicationSecurity', ['$rootScope', 'LoopBackAuth', 'AdditionalAPI', 'User', '$q', '$window', '$cookies',
  function($rootScope, LoopBackAuth, AdditionalAPI, User, $q, $window, $cookies) {
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
        
        var logoutMethod = Environment.getConfig('mainApiUrl') ? AdditionalAPI.logout : User.logout;

        logoutMethod(false,
          function() {
            self.clearUser();
            
            if (typeof options.logoutRedirect !== "undefined" && options.logoutRedirect === false) {
              callback(false, 'Logout successful');
            }
            else {
              if (Environment.getConfig('cookieName')) {
                $cookies.remove(Environment.getConfig('cookieName'));
                // set cookie so that application can use to suppress error messages
                // about being logged out due to expiration of session
                $cookies.putObject(Environment.getConfig('cookieName') + '_triggerlogout', true);
              }

              window.location = options.logoutRedirect || Environment.getConfig('logoutRedirect');

              //callback(false, true);  
            }
            
          },
          function(res) {
            self.clearUser();
            
            if (typeof options.logoutRedirect !== "undefined" && options.logoutRedirect === false) {
              callback(res.data.error);
            }
            else {
              window.location = options.logoutRedirect || Environment.getConfig('logoutRedirect');

              //callback(res.data.error); 
            }
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
            // attach additional user properties to LoopBackAuth user
            LoopBackAuth.setUser(accessToken.id, accessToken.userId, user);
            //LoopBackAuth.isAdmin = user.isAdmin;

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
        
        var loginMethod = options.loginMethod ? options.loginMethod : User.login;
        var findUserMethod = options.findUserMethod ? options.findUserMethod : User.findById;

        loginMethod(userData,
          function(accessToken) {
            if (accessToken.id) {
              LoopBackAuth.setUser(accessToken.id, accessToken.userId, false); 
            }
            
            if (Environment.getConfig('cookieName')) {
              // set cookie used to keep Loopback access token TTL with frontend in sync
              var expiration = Date.now() + (accessToken.ttl * 1000);
              var expirationObj = null;
              if (userData.rememberme) {
                // allow cookie to be retained across browser sessions if "remember me" is checked
                expirationObj = { 
                  expires:new Date(expiration) 
                }; 
              }
          
              $cookies.putObject(Environment.getConfig('cookieName'), {
                id:accessToken.id,
                expiration:expiration
              }, expirationObj); 
            }

            findUserMethod(
              {
                'id' : accessToken.userId
              },
              function(user) {
                //LoopBackAuth.isAdmin = user.isAdmin;
                
                // attach user ID to cookie
                $cookies.putObject(Environment.getConfig('cookieName'), {
                  id:accessToken.id,
                  expiration:expiration,
                  userId:user.id
                }, expirationObj); 
                
                if (typeof options.loginRedirect !== "undefined" && options.loginRedirect === false) {
                  currentUser = user;
                  callback(false, user);
                }
                else {
                  if (Environment.getConfig('loginRedirect') && 
                  typeof Environment.getConfig('loginRedirect') === "function") {
                    options.loginRedirect = Environment.getConfig('loginRedirect')(user, $cookies.getObject(Environment.getConfig('cookieName') + '_loginref'));
                    // delete loginref so that it is only used once
                    $cookies.remove(Environment.getConfig('cookieName') + '_loginref');
                  }

                  currentUser = user;

                  //callback(false, user);

                  window.location = options.loginRedirect || Environment.getConfig('loginRedirect');  
                }
                
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
        var noAuth;
        
        // create array of URLs where no cookie/authentication is required to access
        if (Environment.getConfig('noAuth')) {
          noAuth = Environment.getConfig('noAuth');
          noAuth.push(Environment.getConfig('logoutRedirect')); 
        }
        else {
          noAuth = [];
        }
        
        var findUserById = Environment.getConfig('mainApiUrl') ? AdditionalAPI.findUserById : User.findById;

        return $q(function(resolve, reject) {
          if (!$cookies.getObject(Environment.getConfig('cookieName')) && 
            noAuth.indexOf($window.location.pathname) < 0) {
            // missing cookie, on unauthorized page
            $cookies.putObject(Environment.getConfig('cookieName') + '_loginref', $window.location.pathname + $window.location.hash);
            $window.location = Environment.getConfig('logoutRedirect') + '#/redirect/loginRequired';
          }
          else if ($cookies.getObject(Environment.getConfig('cookieName')) && 
            new Date($cookies.getObject(Environment.getConfig('cookieName')).expiration) < Date.now() && 
            noAuth.indexOf($window.location.pathname) < 0) {
            // expired cookie within current browsing session, redirect to logout page
              $cookies.putObject(Environment.getConfig('cookieName') + '_loginref', $window.location.pathname + $window.location.hash);
              $window.location = Environment.getConfig('logoutRedirect') + '#/redirect/loginRequired';
          }
          else if (self.isAuthenticated()) {
            findUserById(
              {
                'id': self.isAuthenticated()
              },
              function(user) {
                //LoopBackAuth.isAdmin = user.isAdmin;

                currentUser = user;
                $rootScope.$broadcast('userDataAvailable', user);

                resolve(user);
              },
              function (res) {
                self.clearUser();

                reject(res);
              }
            );
          } else {
            if ($cookies.getObject(Environment.getConfig('cookieName'))) {
              var accessToken = $cookies.getObject(Environment.getConfig('cookieName'));
              LoopBackAuth.setUser(accessToken.id, null, false); 
              LoopBackAuth.save();
              
              if (accessToken && accessToken.id) {
                findUserById(
                  {
                    'id': accessToken.userId
                  },
                  function(user) {
                    //LoopBackAuth.isAdmin = user.isAdmin;
                    LoopBackAuth.setUser(accessToken.id, accessToken.userId, user);
                    currentUser = user;

                    //$window.location.reload();

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
            }
            
          }
        });
      }
    };

    $rootScope.ApplicationSecurity = internal;

    return internal;
}]);
