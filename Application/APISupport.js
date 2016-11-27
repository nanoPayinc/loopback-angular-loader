/* global Environment:false */

'use strict';

angular.module('shared')  
.factory('APISupport', ['$rootScope', '$http', '$cookies', '$q', function($rootScope, $http, $cookies, $q) {
  // use alternate API URL (mainApiUrl) if provided, otherwise use primary API URL (apiUrl)
  var apiUrl = Environment.getConfig('mainApiUrl') || Environment.getConfig('apiUrl');
  
  var internal = {
    userAuth:function(data) {
      return $q(function(resolve, reject) {
        $http({
          method:'POST',
          url:apiUrl + '/users/login',
          data:data
        })
        .then(function(data, status, headers, config) {
          resolve(data);
        })
        .catch(function(data, status, headers, config) {
          console.log("userAuth error", data);
          reject(data);
        });
      });
    },
    findUserById:function(where) {
      return $q(function(resolve, reject) {
        if (typeof where !== "undefined" && typeof where.id !== "undefined" && 
        typeof $cookies.getObject(Environment.getConfig('cookieName')) !== "undefined" && 
        typeof $cookies.getObject(Environment.getConfig('cookieName')).id !== "undefined") {
          $http({
            method:'GET',
            url:apiUrl + '/users/' + where.id,
            headers:{
              'Authorization':$cookies.getObject(Environment.getConfig('cookieName')).id
            }
          })
          .then(function(data) {
            resolve(data);
          })
          .catch(function(response) {
            reject(data);
          }); 
        }
        else {
          reject(null);
        }
      });
    },
    logout:function() {
      return $q(function(resolve, reject) {
        $http({
          method:'POST',
          url:apiUrl + '/users/logout',
          headers:{
            'Authorization':$cookies.getObject(Environment.getConfig('cookieName')).id
          }
        })
        .then(function(data, status, headers, config) {
          resolve(data);
        })
        .catch(function(data, status, headers, config) {
          console.log("logout error", data);
          reject(data);
        });
      });
    },
    oAuth2Authorize:function(params) {
      return $q(function(resolve, reject) {
        $http({
          method:'GET',
          url:apiUrl + '/oauth2/authorize',
          params:params
        })
        .then(function(data, status, headers, config) {
          resolve(data);
        })
        .catch(function(data, status, headers, config) {
          console.log("oAuth2Authorize error", data);
          reject(data);
        });
      });
    },
    oAuth2Token:function(data) {
      return $q(function(resolve, reject) {
        $http({
          method:'POST',
          url:apiUrl + '/oauth2/token',
          data:data
        })
        .then(function(data, status, headers, config) {
          resolve(data);
        })
        .catch(function(data, status, headers, config) {
          console.log("oAuth2Token error", data);
          reject(data);
        });
      });
    }
  };
  
  $rootScope.AdditionalAPI = internal;
  return internal;

}]);