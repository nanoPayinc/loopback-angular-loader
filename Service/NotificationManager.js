/* global Environment:false */

'use strict';

angular
  .module('shared')
  .factory('NotificationManager', ['toaster', function(toaster) {
    var notificationList = [];

    return {
      error: function (message) {
        notificationList.push({
          'message': message,
          'type':    'error',
          'hidden':  false,
          'timeout': 0
        })

        toaster.pop('error', 'Error', message);
      },
      success: function (message) {
        notificationList.push({
          'message': message,
          'type':    'success',
          'hidden':  false,
          'timeout': 0
        })

        toaster.pop('success', 'Ok', message);
      }
    }
  }]);
