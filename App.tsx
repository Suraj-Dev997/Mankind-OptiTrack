/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// import AddCampReport from './components/CampReport/AddCampReport';
// import AddCampData from './components/CampReport/AddCampData';
// import UploadCampImages from './components/CampReport/UploadCampImages';
// import ReportList from './components/CampReport/ReportList';
// import UpdateCampData from './components/CampReport/UpdateCampData';
// import UpdateCampReport from './components/CampReport/UpdateCampReport';
// import UpdateCampImages from './components/CampReport/UpdateCampImages';
// import CampInfo from './components/CampReport/CampInfo';

import React from 'react';
import {StyleSheet, View, Text,Alert} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Ham from './components/Layouts/Ham';
import {Login} from './components/Login/Login';
import {Home} from './components/Home/Home';
import {SplashScreen} from './components/SplashScreen/SplashScreen';
import {HomeMenu} from './components/Home/HomeMenu';
import PosterList from './components/PosterActivity/PosterList';
import PosterDownload from './components/PosterActivity/PosterDownload';
import DashboardList from './components/Dashboard/DashboardList';
import UserProfileForm from './components/PosterActivity/UserProfileForm';
import UpdateUserProfileForm from './components/PosterActivity/UpdateUserProfileForm';
import Test from './components/Test';
import DEAddCampData from './components/DryEyeScreening/DEAddCampData';
import DEAddCampReport from './components/DryEyeScreening/DEAddCampReport';
import DEUploadCampImages from './components/DryEyeScreening/DEUploadCampImages';
import DECampInfo from './components/DryEyeScreening/DECampInfo';
import DEReportList from './components/DryEyeScreening/DEReportList';
import DEUpdateCampData from './components/DryEyeScreening/DEUpdateCampData';
import DEUpdateCampImages from './components/DryEyeScreening/DEUpdateCampImages';
import DEUpdateCampReport from './components/DryEyeScreening/DEUpdateCampReport';
import GAddCampData from './components/GlaucomaScreening/GAddCampData';
import GAddCampReport from './components/GlaucomaScreening/GAddCampReport';
import GUploadCampImages from './components/GlaucomaScreening/GUploadCampImages';
import GCampInfo from './components/GlaucomaScreening/GCampInfo';
import GReportList from './components/GlaucomaScreening/GReportList';
import GUpdateCampData from './components/GlaucomaScreening/GUpdateCampData';
import GUpdateCampImages from './components/GlaucomaScreening/GUpdateCampImages';
import GUpdateCampReport from './components/GlaucomaScreening/GUpdateCampReport';
import OPAddCampReport from './components/OPEntry/OPAddCampReport';
import OPCampInfo from './components/OPEntry/OPCampInfo';
import OPReportList from './components/OPEntry/OPReportList';
import OPUpdateCampImages from './components/OPEntry/OPUpdateCampImages';
import OPUpdateCampReport from './components/OPEntry/OPUpdateCampReport';
import OPUploadCampImages from './components/OPEntry/OPUploadCampImages';
import DashHomeMenu from './components/Dashboard/DashHomeMenu';
import GDashboardList from './components/Dashboard/GDashboardList';
import PosterHomeMenu from './components/PosterActivity/PosterHomeMenu';
import PosterSubMenu from './components/PosterActivity/PosterSubMenu';
import NIPosterList from './components/PosterActivity/NIPosterList';
import NIUserProfileForm from './components/PosterActivity/NIUserProfileForm';
import NIUpdateUserProfileForm from './components/PosterActivity/NIUpdateUserProfileForm';
import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';
import {Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';




interface Notification {
  foreground: boolean;
  userInteraction: boolean;
  message: string;
  data: {
    [key: string]: any;
  };
  // Include any other properties your notification might have
}

const Stack = createNativeStackNavigator();



async function requestUserPermission() {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      } else {
        console.log('Permission not granted:', authStatus);
      }
  } catch (error) {
    console.log('Error requesting user permission:', error);
  }
}

const getToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log("Token =", token);
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
}



function App(): JSX.Element {
  useEffect(() => {
    requestUserPermission();
    getToken();

 // Create a notification channel
 PushNotification.createChannel(
  {
    channelId: "default-channel-id", // (required)
    channelName: "Default Channel", // (required)
    channelDescription: "A default channel", // (optional) default: undefined.
    soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
    importance: 4, // (optional) default: 4. Int value of the Android notification importance
    vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
  },
  (created: boolean) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
);

// Configure local notifications
PushNotification.configure({
  onNotification: function (notification: Notification) {
    console.log("LOCAL NOTIFICATION ==>", notification);
    Alert.alert('Notification', notification.message);
  },
  popInitialNotification: true,
  requestPermissions: Platform.OS === 'ios',
});

// Foreground state messages
const unsubscribe = messaging().onMessage(async remoteMessage => {
  console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
  Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
  PushNotification.localNotification({
    channelId: "default-channel-id", // Use the same channel ID
    title: remoteMessage.notification?.title || 'No Title',
    message: remoteMessage.notification?.body || 'No Message',
  });
});

// Background and quit state messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  PushNotification.localNotification({
    channelId: "default-channel-id", // Use the same channel ID
    title: remoteMessage.notification?.title || 'No Title',
    message: remoteMessage.notification?.body || 'No Message',
  });
});

return unsubscribe;
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerRight: () => <Ham />,
          headerTintColor: '#fff',
          headerStyle: {
            backgroundColor: '#000953',
          },
        }}>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            title: 'Mankind',
            headerLeft: () => (
              <View>
                <Text style={styles.dot}>.</Text>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{headerShown: false}}
        />
        {/* <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} /> */}
        <Stack.Screen name="Test" component={Test} />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{title: 'User Login', headerShown: false}}
        />
        <Stack.Screen name="Ham" component={Ham} />
        <Stack.Screen
          name="HomeMenu"
          component={HomeMenu}
          options={{title: 'Menu'}}
        />
        <Stack.Screen
          name="DashHomeMenu"
          component={DashHomeMenu}
          options={{title: 'Menu'}}
        />
        <Stack.Screen
          name="PosterHomeMenu"
          component={PosterHomeMenu}
          options={{title: 'Menu'}}
        />
         <Stack.Screen
          name="PosterSubMenu"
          component={PosterSubMenu}
          options={{title: 'Menu'}}
        />
        <Stack.Screen
          name="PosterList"
          component={PosterList}
          options={{title: 'Doctors List'}}
        />
        <Stack.Screen
          name="NIPosterList"
          component={NIPosterList}
          options={{title: 'Doctors List'}}
        />
        <Stack.Screen
          name="DashboardList"
          component={DashboardList}
          options={{title: 'Download Report'}}
        />
        <Stack.Screen
          name="GDashboardList"
          component={GDashboardList}
          options={{title: 'Download Report'}}
        />
        <Stack.Screen
          name="UserProfileForm"
          component={UserProfileForm}
          options={{title: 'Add Doctor'}}
        />
        <Stack.Screen
          name="UpdateUserProfileForm"
          component={UpdateUserProfileForm}
          options={{title: 'Update Doctor'}}
        />
         <Stack.Screen
          name="NIUserProfileForm"
          component={NIUserProfileForm}
          options={{title: 'Add Doctor'}}
        />
        <Stack.Screen
          name="NIUpdateUserProfileForm"
          component={NIUpdateUserProfileForm}
          options={{title: 'Update Doctor'}}
        />
        <Stack.Screen
          name="PosterDownload"
          component={PosterDownload}
          options={{title: 'Download Poster'}}
        />
        <Stack.Screen
          name="DEReportList"
          component={DEReportList}
          options={{title: 'DE Camp Report List'}}
        />
        <Stack.Screen
          name="DEAddCampReport"
          component={DEAddCampReport}
          options={{title: 'Add Doctor Detail'}}
        />
        <Stack.Screen
          name="DEAddCampData"
          component={DEAddCampData}
          options={{title: 'Add Camp Detail'}}
        />
        <Stack.Screen
          name="DEUploadCampImages"
          component={DEUploadCampImages}
          options={{title: 'Add Camp Images'}}
        />
        <Stack.Screen
          name="DEUpdateCampReport"
          component={DEUpdateCampReport}
          options={{title: 'Update Doctor Detail'}}
        />
        <Stack.Screen
          name="DEUpdateCampData"
          component={DEUpdateCampData}
          options={{title: 'Update Camp Detail'}}
        />
        <Stack.Screen
          name="DEUpdateCampImages"
          component={DEUpdateCampImages}
          options={{title: 'Update Camp Images'}}
        />
        <Stack.Screen
          name="DECampInfo"
          component={DECampInfo}
          options={{title: 'Camp Info'}}
        />
        <Stack.Screen
          name="GReportList"
          component={GReportList}
          options={{title: 'G Camp Report List'}}
        />
        <Stack.Screen
          name="GAddCampReport"
          component={GAddCampReport}
          options={{title: 'Add Doctor Detail'}}
        />
        <Stack.Screen
          name="GAddCampData"
          component={GAddCampData}
          options={{title: 'Add Camp Detail'}}
        />
        <Stack.Screen
          name="GUploadCampImages"
          component={GUploadCampImages}
          options={{title: 'Add Camp Images'}}
        />
        <Stack.Screen
          name="GUpdateCampReport"
          component={GUpdateCampReport}
          options={{title: 'Update Doctor Detail'}}
        />
        <Stack.Screen
          name="GUpdateCampData"
          component={GUpdateCampData}
          options={{title: 'Update Camp Detail'}}
        />
        <Stack.Screen
          name="GUpdateCampImages"
          component={GUpdateCampImages}
          options={{title: 'Update Camp Images'}}
        />
        <Stack.Screen
          name="GCampInfo"
          component={GCampInfo}
          options={{title: 'Camp Info'}}
        />
        <Stack.Screen
          name="OPReportList"
          component={OPReportList}
          options={{title: 'PO Camp Report List'}}
        />
        <Stack.Screen
          name="OPAddCampReport"
          component={OPAddCampReport}
          options={{title: 'Add Doctor Detail'}}
        />
        <Stack.Screen
          name="OPUploadCampImages"
          component={OPUploadCampImages}
          options={{title: 'Add Camp Detail'}}
        />
        <Stack.Screen
          name="OPUpdateCampReport"
          component={OPUpdateCampReport}
          options={{title: 'Update Doctor Detail'}}
        />
        <Stack.Screen
          name="OPUpdateCampImages"
          component={OPUpdateCampImages}
          options={{title: 'Update Camp Detail'}}
        />
        <Stack.Screen
          name="OPCampInfo"
          component={OPCampInfo}
          options={{title: 'Camp Info'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  dot: {
    color: '#000953',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
