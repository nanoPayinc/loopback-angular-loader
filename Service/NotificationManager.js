/* global Environment:false */

'use strict';

angular
  .module('shared')
  .factory('NotificationManager', ['toaster', function(toaster) {
    var notificationList = [];
    var notification;

    if (window.localStorage['notificationList'] === undefined) {
      window.localStorage['notificationList'] = JSON.stringify([]);
    };

    var manager = {
      addMessage: function (message, type, timeout) {
        notificationList.push({
          'message': message,
          'type':    type,
          'timeout': timeout
        });

        setTimeout(this.showPendingMessages, timeout);

        window.localStorage['notificationList'] = JSON.stringify(notificationList);
      },
      showPendingMessages: function () {
        notificationList = JSON.parse(window.localStorage['notificationList']);

        while((notification=notificationList.pop()) != null){
          if (notification.type === 'error') {
            toaster.pop('error', 'Error', notification.message);
          }

          if (notification.type === 'success') {
            toaster.pop('success', 'Ok', notification.message);
          }
        }

        window.localStorage['notificationList'] = JSON.stringify(notificationList);
      },
      error: function (message, timeout) {
        if (! timeout) {
          timeout = 0;
        }

        if (! timeout) {
          toaster.pop('error', 'Error', message);
        } else {
          this.addMessage(message, 'error', timeout);
        }
      },
      success: function (message, timeout) {
        if (! timeout) {
          timeout = 0;
        }

        if (! timeout) {
          toaster.pop('success', 'Ok', message);
        } else {
          this.addMessage(message, 'success', timeout);
        }
      }
    }

    setTimeout(manager.showPendingMessages, 500);

    return manager;
  }]);
