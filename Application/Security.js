/* global Environment:false */

'use strict';

angular.module('shared')

.factory(
  'ApplicationSecurity', ['$rootScope', 'LoopBackAuth', 'AdditionalAPI', 'NotificationManager', '$q', '$window', '$cookies', '$location',
  function($rootScope, LoopBackAuth, AdditionalAPI, NotificationManager, $q, $window, $cookies, $location) {
    var currentUser = {};

    var internal = {
      user: function() {
        // return currentUser;
      },
      isAuthenticated: function () {
        // return LoopBackAuth.currentUserId; /// !!! refactor to use boolean value
      },
      userId: function () {
        // return LoopBackAuth.currentUserId;
      },
      accessToken: function() {
        // return LoopBackAuth.accessTokenId;
      },
      isAdmin: function () {
        // return LoopBackAuth.isAdmin || false;
      },
      logout: function(callback, options) {
        // if (! options) {
        //   options = {};
        // }

        // if (typeof callback === 'undefined' || !callback) {
        //   callback = function(){};
        // }

        // var self = this;

        // AdditionalAPI.logout(false)
        // .then(function() {
        //   self.clearUser();

        //   if (typeof options.logoutRedirect !== "undefined" && options.logoutRedirect === false) {
        //     callback(false, 'Logout successful');
        //   }
        //   else {
        //     if (Environment.getConfig('cookieName')) {
        //       $cookies.remove(Environment.getConfig('cookieName'));
        //       // set cookie so that application can use to suppress error messages
        //       // about being logged out due to expiration of session
        //       $cookies.putObject(Environment.getConfig('cookieName') + '_triggerlogout', true);
        //     }

        //     $location.path(options.logoutRedirect || Environment.getConfig('logoutRedirect'));

        //     //callback(false, true);
        //   }
        // })
        // .catch(function(res) {
        //   self.clearUser();

        //   if (typeof options.logoutRedirect !== "undefined" && options.logoutRedirect === false) {
        //     callback(res.data.error);
        //   }
        //   else {
        //     $location.path(options.logoutRedirect || Environment.getConfig('logoutRedirect'));

        //     //callback(res.data.error);
        //   }
        // })
      },
      loginByToken: function (userData, callback) {
        // var accessToken = userData.userData;

        // LoopBackAuth.setUser(accessToken.id, accessToken.userId, false);
        // LoopBackAuth.rememberMe = true;
        // LoopBackAuth.save();

        // AdditionalAPI.findUserById({
        //   'id' : accessToken.userId
        // })
        // .then(function(user) {
        //   // attach additional user properties to LoopBackAuth user
        //   LoopBackAuth.setUser(accessToken.id, accessToken.userId, user);
        //   //LoopBackAuth.isAdmin = user.isAdmin;

        //   LoopBackAuth.save();

        //   currentUser = user;

        //   callback(false, user);

        //   $location.path(Environment.getConfig('loginRedirect'));
        // })
        // .catch(function(res) {
        //   callback(res);
        // });
      },
      oAuth2Authorize: function(client_id, redirect_uri, response_type, scope, user, callback) {
        // var self = this;

        // switch (response_type) {
        // case "code":
        //   // authorization code grant
        //   AdditionalAPI.oAuth2Authorize({
        //     client_id:client_id,
        //     redirect_uri:redirect_uri,
        //     response_type:"code",
        //     scope:scope,
        //     user_id:user
        //   })
        //   .then(function(authCode) {
        //     //console.log(authCode);
        //     if (authCode.authorizationCode) {
        //       // exchange auth code for access token, API will auto-supply the client secret
        //       return AdditionalAPI.oAuth2Token({
        //         code:authCode.authorizationCode,
        //         client_id:client_id,
        //         client_secret:null,
        //         grant_type:"authorization_code",
        //         redirect_uri:authCode.redirectUri
        //       });
        //     }
        //     else {
        //       console.log("Error authorizing application with oAuth2 server");
        //     }
        //   })
        //   .then(function(accessToken) {
        //     console.log(accessToken);

        //     accessToken.id = accessToken.accessToken;
        //     LoopBackAuth.setUser(accessToken.id, null, false);
        //     LoopBackAuth.save();

        //     // don't need callback (callback will always be URL redirect)
        //     self.initLogin(accessToken, {
        //       rememberme:true
        //     }, {}, {
        //       loginRedirect: accessToken.client.redirectUri
        //     }, user);
        //   })
        //   .catch(function(authCodeError) {
        //     console.log(authCodeError);
        //   });
        //   break;
        // }
      },
      initLogin: function(accessToken, userData, callback, options, user) {
        // //LoopBackAuth.isAdmin = user.isAdmin;
        // if (Environment.getConfig('cookieName')) {
        //   // set cookie used to keep Loopback access token TTL with frontend in sync
        //   var expiration = $cookies.getObject(Environment.getConfig('cookieName')).expiration
        //   var expirationObj = null;
        //   if (userData.rememberme) {
        //     // allow cookie to be retained across browser sessions if "remember me" is checked
        //     expirationObj = {
        //       expires:new Date(expiration)
        //     };
        //   }

        //   $cookies.putObject(Environment.getConfig('cookieName'), {
        //     id: accessToken,
        //     expiration: expiration,
        //     user:user,
        //     userId:user.id
        //   }, expirationObj);
        // }

        // if (typeof options.loginRedirect !== "undefined" && options.loginRedirect === false) {
        //   currentUser = user;
        //   callback(false, user);
        // }
        // else {
        //   if (!options.loginRedirect && Environment.getConfig('loginRedirect') &&
        //   typeof Environment.getConfig('loginRedirect') === "function") {
        //     // options.loginRedirect = specific redirect based on context (e.g. oAuth2 client)
        //     // cookie loginRedirect = generic application redirect landing pages

        //     options.loginRedirect = Environment.getConfig('loginRedirect')(user, $cookies.getObject(Environment.getConfig('cookieName') + '_loginref'));
        //   }

        //   // delete loginref so that it is only used once
        //   $cookies.remove(Environment.getConfig('cookieName') + '_loginref');

        //   // remove oAuth2 temporary cookies
        //   $cookies.remove('client_id');
        //   $cookies.remove('redirect_uri');
        //   $cookies.remove('response_type');
        //   $cookies.remove('scope');
        //   $cookies.remove('user');

        //   currentUser = user;

        //   //callback(false, user);
        //   var redirect = options.loginRedirect || Environment.getConfig('loginRedirect');
        //   if (redirect == $location.path() + $location.hash()) {
        //     // don't attempt to redirect to current page, reload it instead
        //     $location.reload();
        //   }
        //   else {
        //     $location.path(redirect);
        //   }
        // }
      },
      login: function(userData, callback, options) {
        // var self = this;

        // if (! options) {
        //   options = {};
        // }

        // return $q(function(resolve, reject) {
        //   AdditionalAPI.userAuth(userData)
        //   .then(function(accessToken) {
        //     accessToken = accessToken.data;

        //     if (accessToken.id) {
        //       LoopBackAuth.setUser(accessToken.id, accessToken.userId, false);
        //       LoopBackAuth.save();
        //     }
        //     else {
        //       reject();
        //     }

        //     if (Environment.getConfig('cookieName')) {
        //       // set cookie used to keep Loopback access token TTL with frontend in sync
        //       var expiration = Date.now() + (accessToken.ttl * 1000);
        //       var expirationObj = null;
        //       if (userData.rememberme) {
        //         // allow cookie to be retained across browser sessions if "remember me" is checked
        //         expirationObj = {
        //           expires:new Date(expiration)
        //         };
        //       }

        //       $cookies.putObject(Environment.getConfig('cookieName'), {
        //         id: accessToken.id,
        //         expiration:expiration
        //       }, expirationObj);
        //     }

        //     return AdditionalAPI.findUserById({
        //       'id': accessToken.userId
        //     });
        //   })
        //   .then(function(user) {
        //     self.initLogin(LoopBackAuth.accessTokenId, userData, callback, options, user);
        //   })
        //   .catch(function(err) {
        //     console.log(err);
        //     callback(err);
        //   })
        // });
      },
      clearUser: function() {
        currentUser = false;

        LoopBackAuth.clearUser();
        //LoopBackAuth.isAdmin = false;
        LoopBackAuth.rememberMe = true; // Cleaning local storage
        LoopBackAuth.save();

        LoopBackAuth.rememberMe = false; // Cleaning session storage
        LoopBackAuth.save();
      },
      preloadUser: function() {
        var self = this;
        // create array of URLs where no cookie/authentication is required to access
        var noAuth = Environment.getConfig('noAuth') || [];
        noAuth.push(Environment.getConfig('logoutRedirect'));

        return $q(function(resolve, reject) {
          if (!$cookies.getObject(Environment.getConfig('cookieName')) &&
            noAuth.indexOf($location.path()) < 0 &&
            noAuth.indexOf($location.hash()) < 0) {
            // missing cookie, on unauthorized page, redirect to logout page
            $cookies.putObject(Environment.getConfig('cookieName') + '_loginref', $location.path() + $location.hash());
            $location.path(Environment.getConfig('logoutRedirect'));
          }
          else if ($cookies.getObject(Environment.getConfig('cookieName')) &&
            new Date($cookies.getObject(Environment.getConfig('cookieName')).expiration) < Date.now() &&
            noAuth.indexOf($location.path()) < 0) {
            // expired cookie within current browsing session, redirect to logout page
              $cookies.putObject(Environment.getConfig('cookieName') + '_loginref', $location.path()+ $location.hash());
              $location.path(Environment.getConfig('logoutRedirect'));
          }
          else if ($cookies.getObject(Environment.getConfig('cookieName'))) {
            var accessToken = $cookies.getObject(Environment.getConfig('cookieName'));

            // LoopBackAuth.setUser(accessToken.id, null, false);
            // LoopBackAuth.save(); 
          }
        });
      }
    };
    
    $rootScope.ApplicationSecurity = internal;

    return internal;
}]);