import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {BASE_URL} from '../Configuration/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {IconButton} from 'react-native-paper';

export const PosterHomeMenu = props => {
  const route = useRoute();
  const {category} = route.params;
  const [subcategories, setSubcategories] = useState([]);
  const [totalCamps, setTotalCamps] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch subcategories from the API
    const ApiUrl = `${BASE_URL}${'/cat/getPosterCategory'}`;
    fetch(ApiUrl)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const subcategoryData = data.map(subcategory => ({
          id: subcategory.pcat_id,
          name: subcategory.cat_name,
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
        navigation.navigate('PosterSubMenu', {id: id, name: name});
        break;
      case 2:
        navigation.navigate('PosterSubMenu', {id: id, name: name});
        break;
      case 7:
        navigation.navigate('PosterList', {id: id, name: name});
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
                    icon="file-image-plus"
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
  const renderIcon = iconName => {
    switch (iconName) {
      case 1:
        return <IconButton icon="file-image-plus" iconColor="#fff" size={30} />;
      case 2:
        return (
          <IconButton
            icon="file-document-edit-outline"
            iconColor="#fff"
            size={30}
          />
        );
      default:
        return null;
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
    borderColor: '#fff',
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
    color: 'white',
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

    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
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

export default PosterHomeMenu;
