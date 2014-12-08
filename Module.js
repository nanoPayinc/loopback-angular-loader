'use strict';

angular.module('shared', [
  'lbServices',
  'toaster'
])
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.useXDomain = true;

    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }]);
