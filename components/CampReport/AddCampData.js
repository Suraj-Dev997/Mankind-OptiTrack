import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {TextInput, Button, Avatar} from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {BASE_URL} from '../Configuration/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import MultiSelect from 'react-native-multiple-select';

import {da} from 'date-fns/locale';

const AddCampData = () => {
  const [qualification, setQualification] = useState('');
  const [avatarUri, setAvatarUri] = useState(null); // To store the URI of the selected image
  const [campDate, setCampDate] = useState(new Date());
  const [showCampDatePicker, setShowCampDatePicker] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const [selectedValue, setSelectedValue] = useState('option1');
  const [brandOptions, setBrandOptions] = useState([]); // To store brand options from the API
  const navigation = useNavigation();
  const route = useRoute();
  const {crid, id} = route.params;
  const [selectedItems, setSelectedItems] = useState([]);

  const onSelectedItemsChange = selectedItems => {
    console.log('MultiSelect Selected Items:', selectedItems);
    setSelectedItems(selectedItems);
  };
  // console.log('route',id)

  const submitData = () => {
    console.log('Selected item', selectedItems);
    if (!selectedItems || selectedItems.length === 0 || !selectedAnswers) {
      // Display an alert message if any required fields are empty
      alert('Please fill in all required fields');
      return;
    }
    // Retrieve the userId from AsyncStorage
    const selectedItemsString = selectedItems.join(',');
    AsyncStorage.getItem('userdata')
      .then(data => {
        if (data) {
          const userData = JSON.parse(data);
          const userId = userData.responseData.user_id;

          // Create an array to store the payload data dynamically
          const dataArray = [];

          // Loop through selectedAnswers to create the payload
          for (const rqid in selectedAnswers) {
            if (selectedAnswers.hasOwnProperty(rqid)) {
              const answer = selectedAnswers[rqid];
              const dataItem = {
                rqid: rqid,
                crid: crid,
                subCatId: id, // You can set the correct value for crid
                brand_id: selectedItemsString, // Use the selected brand value
                value: answer,
                user_id: userId, // Use the retrieved userId dynamically
              };
              dataArray.push(dataItem);
            }
          }
          const ApiUrl = `${BASE_URL}${'/report/addAnswer'}`;
          // Send a POST request to the API
          fetch(ApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({dataArray}),
          })
            .then(response => response.json())
            .then(data => {
              // Handle the response from the API as needed
              console.log('API Response:', data);

              // Check if the API request was successful
              if (data.errorCode === '1') {
                // Navigate to the "UploadCampImages" screen on success
                navigation.navigate('UploadCampImages', {crid, id});
                console.log('forworded crid', crid);
              } else {
                console.log('API Request was not successful');
                // Display an alert message for the user
                alert('Fill all the details');
              }
              // After successfully submitting data, you can navigate to the next screen
            })
            .catch(error => {
              console.error('Error submitting data:', error);
            });
        } else {
          console.log('Invalid or missing data in AsyncStorage');
        }
      })
      .catch(error => {
        console.error('Error retrieving data:', error);
      });
  };
  const print = () => {
    console.log(selectedItems);
  };
  useEffect(() => {
    // Fetch questions from the API
    const ApiUrl = `${BASE_URL}${'/report/getQuestionWithSubCatId'}`;
    fetch(ApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subCatId: id,
      }),
    })
      .then(response => response.json())
      .then(data => {
        // console.log('API Response:', data);
        setQuestions(data[0]);
      })
      .catch(error => {
        console.error('Error fetching questions:', error);
      });

    //       console.log('questions:', questions);
    // console.log('selectedAnswers:', selectedAnswers);
  }, [questions, selectedAnswers, id]);

  const handleAnswerChange = (rqid, answer) => {
    setSelectedAnswers({...selectedAnswers, [rqid]: answer});
  };

  const renderQuestions = () => {
    if (!questions || questions.length === 0) {
      return (
        <Text style={styles.errorText}>
          Error loading questions. Please check your internet connection and try
          again.
        </Text>
      );
    }

    return questions.map(question => (
      <View key={question.rqid}>
        <Text style={styles.datePickerLabel}>{question.question}</Text>
        <TextInput
          // label={`Answer for ${question.question}`}
          value={selectedAnswers[question.rqid] || ''}
          onChangeText={text => handleAnswerChange(question.rqid, text)}
          mode="outlined"
          style={styles.input}
          outlineColor="#000953"
          activeOutlineColor="#08a5d8"
          keyboardType="numeric"
        />
      </View>
    ));
  };
  useEffect(() => {
    const ApiUrl = `${BASE_URL}${'/report/getBrandName'}`;
    // Fetch brand options from the API
    fetch(ApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subCatId: id,
      }),
    })
      .then(response => response.json())
      .then(data => {
        // Assuming data is an array of brand objects
        console.log(data);
        setBrandOptions(data[0]);
      })
      .catch(error => {
        console.error('Error fetching brand options:', error);
      });
  }, [id]);

  // console.log('Brand option', brandOptions);
  const handleCampDateChange = (event, selectedDate) => {
    setShowCampDatePicker(false);
    if (selectedDate) {
      setCampDate(selectedDate);
    }
  };
  const showCampDate = () => {
    setShowCampDatePicker(true);
  };

  return (
    <LinearGradient colors={['#000953', '#a6e9ff']} style={styles.container}>
      <View style={styles.container}>
        <View style={styles.form}>
          {renderQuestions()}
          <Text style={styles.datePickerLabel}>Select Brand</Text>
          <MultiSelect
            outlineColor="#000953"
            activeOutlineColor="#08a5d8"
            items={brandOptions.map(item => ({
              id: item.basic_id,
              name: item.description,
            }))}
            uniqueKey="id"
            onSelectedItemsChange={onSelectedItemsChange}
            selectedItems={selectedItems}
            selectText="Select Brand"
            style={{
              selectText: {
                color: '#000953',
                fontSize: 16,
                fontWeight: 'bold',
              },
            }}
            searchInputPlaceholderText="Search Brands..."
            onChangeInput={text => console.log(text)}
            tagRemoveIconColor="#dc222d"
            tagBorderColor="#000953"
            tagTextColor="#000953"
            tagContainerStyle={{backgroundColor: '#fff'}}
            selectedItemTextColor="#000953"
            styleDropdownMenu={{
              borderWidth: 1,
              borderColor: '#000953',
              height: 50,
              paddingLeft: 10,
              backgroundColor: '#fff',
            }}
            selectedItemIconColor="#000953"
            itemTextColor="#000"
            displayKey="name"
            searchInputStyle={{color: '#000953'}}
            submitButtonColor="#000953"
            submitButtonText="Submit"
          />
          <LinearGradient colors={['#000953', '#092d4f']} style={styles.addbtn}>
            <Button onPress={submitData} labelStyle={styles.addbtnText}>
              Next
            </Button>
          </LinearGradient>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  addbtn: {
    backgroundColor: '#000953',
    paddingLeft: 1,
    paddingRight: 1,
    color: 'white',
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 50,
  },
  addbtn1: {
    color: '#fff',
  },
  addbtnText: {
    color: '#fff', // Set the text color here
  },
  datePickerContainer: {
    flexDirection: 'column',
    // alignItems:'center'
  },
  pickcontainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#000953',
    borderRadius: 5,
    marginTop: 2,
    marginBottom: 15,
  },
  picker: {
    // backgroundColor:'#fff',
    width: '100%',
    borderWidth: 1,
    borderColor: '#000953',
    borderRadius: 5,
    padding: 0,
  },
  datePickerLabel: {
    fontSize: 14, // You can adjust the font size as needed
    marginBottom: 0, // Spacing between label and button
    color: '#000953',
    fontWeight: '600',
  },
  datePickerButton: {
    width: 'auto',
    borderRadius: 5,
    textAlign: 'left',
    alignItems: 'flex-start',
    fontSize: 16, // You can adjust the font size as needed
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000953',
    padding: 5,
    marginBottom: 12,
  },
  container: {
    // backgroundColor:'#B9D9EB',
    flex: 1,
    padding: 16,
  },
  form: {
    marginTop: 40,
    flex: 1,
  },
  input: {
    borderColor: 'blue',
    marginBottom: 12,
  },
  profileimg: {},
  button: {
    marginTop: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  changeAvatarText: {
    color: '#000953',
    textAlign: 'center',
  },
});

export default AddCampData;
