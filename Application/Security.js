/* global Environment:false */

'use strict';

angular.module('shared')

.factory(
  'ApplicationSecurity', ['$rootScope', 'LoopBackAuth', 'User', 'Oauth2', '$q', '$window', '$cookies',
  function($rootScope, LoopBackAuth, User, Oauth2, $q, $window, $cookies) {
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
      oAuth2Authorize: function(client_id, redirect_uri, response_type, scope, callback) {
        var self = this;
        
        switch (response_type) {
        case "code":
          // authorization code grant
          
          // establish user ID
          
          Oauth2.authorize({
            client_id:client_id, 
            redirect_uri:redirect_uri, 
            response_type:"code", 
            scope:scope, 
            user_id:"57f7fad49dd5d09b4912d60b"
          }, function(authCode) {
            //console.log(authCode);
            if (authCode.authorizationCode) {
              // exchange auth code for access token, API will auto-supply the client secret
              Oauth2.token({
                code:authCode.authorizationCode,
                client_id:client_id,
                client_secret:null,
                grant_type:"authorization_code",
                redirect_uri:authCode.redirectUri 
              }, function(accessToken) {
                console.log(accessToken);
                
                accessToken.id = accessToken.accessToken;
                
                self.initLogin(accessToken, {}, callback, {
                  loginRedirect: accessToken.client.redirectUri
                }, {});
              }, function(accessTokenError) {
                console.log(accessTokenError);
              }); 
            }
            else {
              console.log("Error authorizing application with oAuth2 server");
            }
          }, function(authCodeError) {
            console.log(authCodeError);
          });
          break;
        }
      },
      initLogin: function(accessToken, userData, callback, options, user) {
        LoopBackAuth.isAdmin = user.isAdmin;
        
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
      login: function(userData, callback, options) {
        if (! options) {
          options = {};
        }

        User.login(userData,
          function(accessToken) {
            if (accessToken.id) {
              LoopBackAuth.setUser(accessToken.id, accessToken.userId, false); 
            }

            User.findById(
              {
                'id' : accessToken.userId
              },
              function(user) {
                self.initLogin(accessToken, userData, callback, options, user);
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
            if ($cookies.getObject(Environment.getConfig('cookieName'))) {
              LoopBackAuth.setUser($cookies.getObject(Environment.getConfig('cookieName')).id, null, false); 
            }
            
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
