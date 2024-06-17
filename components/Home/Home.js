import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  Linking,
  StatusBar,
  BackHandler,
  Alert,
  ImageBackground,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import IconF from 'react-native-vector-icons/FontAwesome';
import IconA from 'react-native-vector-icons/AntDesign';
import {IconButton} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {BASE_URL} from '../Configuration/Config';
import {BASE_URL1} from '../Configuration/Config';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {check, PERMISSIONS, request} from 'react-native-permissions';
import Toast from 'react-native-toast-message';
import useNetworkStatus from '../useNetworkStatus';

export const Home = React.forwardRef((props, ref) => {
  const navigation = useNavigation();
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [showDarkModeAlert, setShowDarkModeAlert] = useState(false);

  // const handleCategoryPress = categoryName => {
  //   navigation.navigate('HomeMenu', {category: categoryName});
  // };
  const isConnected = useNetworkStatus();

  useEffect(() => {
    if (!isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection.',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      );
    }
  }, [isConnected]);

  const handleCategoryPress = categoryId => {
    switch (categoryId) {
      case 1:
        navigation.navigate('PosterHomeMenu', {id: categoryId});
        break;
      case 2:
        navigation.navigate('HomeMenu', {category: categoryId});
        break;
      case 3:
        navigation.navigate('OPReportList', {id: categoryId});
        break;
      case 4:
        navigation.navigate('DashHomeMenu', {id: categoryId});
        break;
    }
  };

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    // Define the API endpoint
    const ApiUrl = `${BASE_URL}${'/cat/getAllCategory'}`;

    // Make the API call using fetch
    fetch(ApiUrl)
      .then(response => response.json())
      .then(data => {
        // Check if the response data contains an array of categories
        if (Array.isArray(data) && data.length > 0) {
          // Assuming the categories are in the first element of the array
          const fetchedCategories = data;

          // Update the state with the fetched categories
          setCategories(fetchedCategories);
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  //Version checking code-------------------------------------
  useEffect(() => {
    const ApiVersionUrl = `${BASE_URL}${'/auth/getAppVersion'}`;
    const checkAppVersion = async () => {
      try {
        const response = await fetch(ApiVersionUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        const latestVersion = data[0].version;
        // const latestVersion = '1';
        console.log('this is data', data);
        const currentVersion = DeviceInfo.getVersion(); // Replace with your current app version
        // const currentVersion = '1'; // Replace with your current app version

        console.log('Current b', currentVersion);
        console.log('Latest b', latestVersion);
        if (currentVersion !== latestVersion) {
          console.log('Current a', currentVersion);
          console.log('Latest a', latestVersion);
          Alert.alert(
            'Update Required',
            'A new version of the app is available. Please update to the latest version.',
            [
              {
                text: 'Update',
                onPress: () => {
                  // Replace the URL with your own update URL or the Play Store URL
                  Linking.openURL(
                    'https://play.google.com/store/apps/details?id=com.medicalcamp',
                  );
                },
              },
            ],
            {cancelable: false},
          );
        }
        setShowDarkModeAlert(true);

        setTimeout(() => {
          setShowDarkModeAlert(false);
        }, 2000);
      } catch (error) {
        console.error('Error checking app version:', error);
        Alert.alert(
          'Error',
          'Failed to check the app version. Please try again later.',
        );
      }
    };
    checkAppVersion();
  }, []);

  useEffect(() => {
    if (showDarkModeAlert) {
      Toast.show({
        type: 'info',
        text1: 'Attention',
        text1Style: {
          fontSize: 18, // Adjust font size as needed
          // Change text color
        },
        text2: 'Please do not use the app in dark mode.',
        text2Style: {
          fontSize: 15, // Adjust font size as needed
          color: '#0a3d57',
        },
        visibilityTime: 5000,
      });
    }
  }, [showDarkModeAlert]);

  useEffect(() => {
    requestStoragePermission();
  }, []);
  //Version checking code-------------------------------------
  const requestStoragePermission = async () => {
    try {
      const result = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);

      if (result === 'granted') {
        setPermissionStatus('granted');
      } else {
        setPermissionStatus('denied');
      }
    } catch (error) {
      console.error('Error requesting storage permission:', error);
    }
  };

  // let user = await AsyncStorage.getItem('user');
  const checkLoggedIn = async () => {
    const token = await AsyncStorage.getItem('user');
    console.log(token);
    return token !== null;
  };
  useEffect(() => {
    const backAction = async () => {
      const usertoken = await AsyncStorage.getItem('userdata');
      if (!usertoken) {
        // If the user is not logged in, show an alert or perform any other action you want
        Alert.alert('Confirmation', 'Are you sure you want to exit the app?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {text: 'Exit', onPress: () => BackHandler.exitApp()},
        ]);
      } else {
        // If the user is logged in, prevent going back to the login screen
        return true;
      }
    };

    // Subscribe to the back button press event
    BackHandler.addEventListener('hardwareBackPress', backAction);

    // Cleanup the event listener when the component is unmounted
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);
  const renderIcon = iconName => {
    switch (iconName) {
      case 'Poster':
        return <IconButton icon="file-image" iconColor="#fff" size={30} />;
      case 'Camp':
        return (
          <IconButton
            icon="file-document-edit-outline"
            iconColor="#fff"
            size={30}
          />
        );
      case 'Post Operative Entry':
        return <IconButton icon="file-document" iconColor="#fff" size={30} />;
      case 'Dashboard':
        return <IconButton icon="view-dashboard" iconColor="#fff" size={30} />;
      default:
        return null;
    }
  };

  return (
    <ImageBackground
      source={require('./Images/bg3.jpg')}
      style={styles.backgroundImage}>
      {/* <LinearGradient colors={['#9cbddd', '#b4b2db']} style={styles.container}> */}
      <View style={styles.container}>
        <StatusBar backgroundColor="#000953" />

        <View style={[styles.container1, styles.elevation]}>
          {/* {categories.map((category) => (
           <LinearGradient colors={['#4b93d8',  '#000953']} style={[styles.button,styles.elevation]}>
        <TouchableOpacity
          key={category.id}
          onPress={() => props.navigation.navigate("HomeMenu")}
        >
 
          <Text style={styles.buttonText}>{category.name}</Text>
        </TouchableOpacity>
        </LinearGradient>
      ))} */}
          {categories.map(category => (
            <View key={category.category_id}>
              <TouchableOpacity
                onPress={() => handleCategoryPress(category.category_id)}
                activeOpacity={1}>
                <LinearGradient
                  colors={['#0112A6', '#000953']}
                  style={[styles.button, styles.elevation]}>
                  <View style={styles.iconTextContainer}>
                    {renderIcon(category.categeory_name)}

                    <Text style={styles.buttonText}>
                      {category.categeory_name}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
      {/* </LinearGradient> */}
      <Toast ref={ref} />
    </ImageBackground>
  );
});

const styles = StyleSheet.create({
  iconTextContainer: {
    // flexDirection: 'row',
    alignItems: 'center',
  },
  backgroundImage: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    resizeMode: 'cover', // or 'stretch' if you want the image to stretch to cover the entire screen
  },
  // container: {
  //   // backgroundColor:'#fff',
  //   flexGrow: 1,
  //   justifyContent: 'center',
  // },
  borderbutton: {},
  container1: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  button: {
    borderColor: '#fff',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#000953',
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
  },
  button1: {
    flex: 1,
    marginHorizontal: 3,
    height: 90,
    textAlign: 'center',
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    // borderRadius:10,
  },
  image: {
    width: '100%',
    height: 140,
    // borderRadius:10,
    marginBottom: 6,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 22,
  },
  elevation: {
    elevation: 5,
    shadowColor: '#000',
  },
});
