/* global Environment:false */

'use strict';

angular.module('shared')  
.factory('APISupport', ['$rootScope', '$http', '$cookies', function($rootScope, $http, $cookies) {
  // use alternate API URL (mainApiUrl) if provided, otherwise use primary API URL (apiUrl)
  var apiUrl = Environment.getConfig('mainApiUrl') || Environment.getConfig('apiUrl');
  
  var internal = {
    userAuth:function(data, callback) {
      $http({
        method:'POST',
        url:apiUrl + '/users/login',
        data:data
      })
      .success(function(data, status, headers, config) {
        callback(data);
      })
      .error(function(data, status, headers, config) {
        console.log("userAuth error", data);
      });
    },
    findUserById:function(where, callback) {
      $http({
        method:'GET',
        url:apiUrl + '/users/' + where.id,
        headers:{
          'Authorization':$cookies.getObject(Environment.getConfig('cookieName')).id
        }
      })
      .success(function(data, status, headers, config) {
        callback(data);
      })
      .error(function(data, status, headers, config) {
        console.log("findUserById error", data);
      });
    },
    logout:function(callback) {
      $http({
        method:'POST',
        url:apiUrl + '/users/logout',
        headers:{
          'Authorization':$cookies.getObject(Environment.getConfig('cookieName')).id
        }
      })
      .success(function(data, status, headers, config) {
        callback(data);
      })
      .error(function(data, status, headers, config) {
        console.log("logout error", data);
      });
    },
    oAuth2Authorize:function(params, callback) {
      $http({
        method:'GET',
        url:apiUrl + '/oauth2/authorize',
        params:params
      })
      .success(function(data, status, headers, config) {
        callback(data);
      })
      .error(function(data, status, headers, config) {
        console.log("oAuth2Authorize error", data);
      });
    },
    oAuth2Token:function(data, callback) {
      $http({
        method:'POST',
        url:apiUrl + '/oauth2/token',
        data:data
      })
      .success(function(data, status, headers, config) {
        callback(data);
      })
      .error(function(data, status, headers, config) {
        console.log("oAuth2Token error", data);
      });
    }
  };
  
  $rootScope.AdditionalAPI = internal;
  return internal;

}]);