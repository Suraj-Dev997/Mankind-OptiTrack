import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {BASE_URL} from '../Configuration/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {IconButton} from 'react-native-paper';
import useNetworkStatus from '../useNetworkStatus';

export const HomeMenu = props => {
  const route = useRoute();
  const {category} = route.params;
  const [subcategories, setSubcategories] = useState([]);
  const [totalCamps, setTotalCamps] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);

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

  const fetchTotalCamps = async userId => {
    try {
      const ApiUrl = `${BASE_URL}${'/dashboard/getTotalCamps'}`;
      const response = await fetch(ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId, // You can change the user ID as needed
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const campCount = data[0].camp_count;
          setTotalCamps(campCount);
        }
      } else {
        console.error('Failed to fetch Total Camps data');
      }
    } catch (error) {
      console.error('Error fetching Total Camps data:', error);
    }
  };

  AsyncStorage.getItem('userdata')
    .then(data => {
      if (data) {
        const userData = JSON.parse(data);
        const userId = userData.responseData.user_id;
        // Call fetchData with the retrieved userId

        fetchTotalCamps(userId);
      } else {
        console.log('Invalid or missing data in AsyncStorage');
      }
    })
    .catch(error => {
      console.error('Error retrieving data:', error);
    });

  useEffect(() => {
    fetchTotalCamps();
  }, []);

  const fetchTotalDoctors = async userId => {
    try {
      const ApiUrl = `${BASE_URL}${'/dashboard/getTotalDoctors'}`;
      const response = await fetch(ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId, // You can change the user ID as needed
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const docCount = data[0].doc_count;
          setTotalDoctors(docCount);
        }
      } else {
        console.error('Failed to fetch Total Doctors data');
      }
    } catch (error) {
      console.error('Error fetching Total Doctors data:', error);
    }
  };
  AsyncStorage.getItem('userdata')
    .then(data => {
      if (data) {
        const userData = JSON.parse(data);
        const userId = userData.responseData.user_id;
        // Call fetchData with the retrieved userId

        fetchTotalDoctors(userId);
      } else {
        console.log('Invalid or missing data in AsyncStorage');
      }
    })
    .catch(error => {
      console.error('Error retrieving data:', error);
    });

  useEffect(() => {
    fetchTotalDoctors();
  }, []);

  useEffect(() => {
    // Fetch subcategories from the API
    const ApiUrl = `${BASE_URL}${'/cat/getSubCategory'}`;
    fetch(ApiUrl)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const subcategoryData = data.map(subcategory => ({
          id: subcategory.subcategory_id,
          name: subcategory.subcategory_name,
        }));
        setSubcategories(subcategoryData);
      })
      .catch(error => {
        console.error('Error fetching subcategories:', error);
      });
  }, []);

  const navigateToCategoryScreen = (id, name) => {
    switch (id) {
      case 1:
        props.navigation.navigate('DEReportList', {id, name});
        break;
      case 2:
        props.navigation.navigate('GReportList', {id, name});
        break;
      case 3:
        props.navigation.navigate('OPReportList', {id, name});
        break;
      default:
        break;
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const buttonsPerRow = 1;

  const getContentBasedOnCategory = () => {
    try {
      const subcategoryRows = [];
      for (let i = 0; i < subcategories.length; i += buttonsPerRow) {
        const rowSubcategories = subcategories.slice(i, i + buttonsPerRow);
        subcategoryRows.push(rowSubcategories);
      }

      return (
        <ScrollView>
          {/* Static buttons for the DashboardList category */}
          {category === 3 && (
            <View style={styles.container1}>
              <LinearGradient
                colors={['#fff', '#fff']}
                style={[
                  styles.button1,

                  {
                    width: screenWidth / buttonsPerRow,
                  },
                ]}>
                <TouchableOpacity>
                  <Text style={styles.buttonText1}>Total Camps: </Text>
                  <Text style={styles.buttonText1}>{totalCamps} </Text>
                </TouchableOpacity>
              </LinearGradient>
              <LinearGradient
                colors={['#fff', '#fff']}
                style={[
                  styles.button1,

                  {
                    width: screenWidth / buttonsPerRow,
                  },
                ]}>
                <TouchableOpacity>
                  <Text style={styles.buttonText1}>Total Doctors: </Text>
                  <Text style={styles.buttonText1}>{totalDoctors} </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
          {subcategoryRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.container1}>
              {row.map((subcategory, subcategoryIndex) => (
                <LinearGradient
                  key={subcategory.id}
                  colors={['#0112A6', '#000953']}
                  style={[
                    styles.button,
                    styles.elevation,
                    {
                      width: screenWidth / buttonsPerRow,
                    },
                  ]}
                  onTouchStart={() =>
                    navigateToCategoryScreen(subcategory.id, subcategory.name)
                  } // Use onTouchStart for touch event
                >
                  <IconButton
                    icon="file-document-edit"
                    iconColor="#fff"
                    size={30}
                  />
                  <TouchableOpacity>
                    <Text style={styles.buttonText}>{subcategory.name}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              ))}
            </View>
          ))}
        </ScrollView>
      );
    } catch (error) {
      console.error('Error generating content:', error);
      return 'An error occurred while generating content.';
    }
  };

  return (
    <ImageBackground
      source={require('./Images/bg3.jpg')}
      style={styles.backgroundImage}>
      {/* <LinearGradient colors={['#9cbddd', '#b4b2db']} style={styles.container}> */}
      <StatusBar backgroundColor="#000953" />
      <View>{getContentBasedOnCategory()}</View>
      {/* </LinearGradient> */}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    justifyContent: 'center',
    // alignItems: 'center',
    flex: 1,
    resizeMode: 'cover', // or 'stretch' if you want the image to stretch to cover the entire screen
  },
  // container: {
  //   flex: 1,
  //   justifyContent: 'center',
  // },
  container1: {
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    borderColor: '#000',
    padding: 20,
    flex: 1,
    marginHorizontal: 3,
    height: 150,
    textAlign: 'center',
    backgroundColor: '#000953',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 23,
  },
  button1: {
    flex: 1,
    marginHorizontal: 10,
    height: 80,
    borderWidth: 1,
    borderColor: '#dc222d',
    textAlign: 'center',
    // backgroundColor: '#000953',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 20,
  },
  buttonText1: {
    textAlign: 'center',
    color: '#000953',
    fontSize: 15,
  },
  elevation: {
    elevation: 5,
    shadowColor: '#000',
  },
});

export default HomeMenu;
