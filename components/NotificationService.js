import PushNotification from 'react-native-push-notification';
import {Platform} from 'react-native';

// Configure Push Notification
PushNotification.configure({
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
  },
  requestPermissions: Platform.OS === 'ios',
});

// Function to show local notification
export const showNotification = (title, message) => {
  PushNotification.localNotification({
    title: title,
    message: message,
  });
};
