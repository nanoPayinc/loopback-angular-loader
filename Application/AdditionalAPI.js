/* global Environment:false */

'use strict';

angular.module('shared')  
.factory('AdditionalAPI', ['$rootScope', '$http', '$cookies', function($rootScope, $http, $cookies) {
  var internal = {
    userAuth:function(creds, callback) {
      $http({
        method:'POST',
        url:Environment.getConfig('mainApiUrl') + '/users/login',
        data:creds
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    findUserById:function(where, callback) {
      $http({
        method:'GET',
        url:Environment.getConfig('mainApiUrl') + '/users/' + where.id,
        headers:{
          'Authorization':$cookies.getObject(Environment.getConfig('cookieName')).id
        }
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    }
  };
  
  $rootScope.AdditionalAPI = internal;
  return internal;

}]);