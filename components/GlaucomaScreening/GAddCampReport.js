import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {TextInput, Button, Avatar, DefaultTheme} from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import {useNavigation} from '@react-navigation/native';
import {BASE_URL} from '../Configuration/Config';
import {useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format} from 'date-fns';
import LinearGradient from 'react-native-linear-gradient';

const GAddCampReport = () => {
  const [doctorNames, setDoctorNames] = useState([]);
  const [filteredDoctorNames, setFilteredDoctorNames] = useState([]);
  const [repname, setRepname] = useState('');
  const [doctorContact, setDoctorContact] = useState('');
  const [doctorAddress, setDoctorAddress] = useState(''); // To store the URI of the selected image
  const [campDate, setCampDate] = useState(new Date());
  const [venue, setVenue] = useState('');
  const [showCampDatePicker, setShowCampDatePicker] = useState(false);
  const [campname, setCampName] = useState();
  const [loction, setLocation] = useState();
  const [doctor1, setDoctor1] = useState();
  const [doctor2, setDoctor2] = useState();
  const [doctor3, setDoctor3] = useState();
  const [doctor4, setDoctor4] = useState();
  const [address, setAddress] = useState();
  const [centername, setCenterName] = useState('');
  const [city, setCity] = useState([]);
  const [state, setState] = useState([]);
  const [zone, setZone] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [numDoctors, setNumDoctors] = useState(1);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [textInputValue, setTextInputValue] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dropdownItems] = useState(['Option 1', 'node', 'React']);
  const route = useRoute();
  const {id} = route.params;
  const formattedCampDate = format(campDate, 'dd-MM-yyyy');
  const [loading, setLoading] = useState(false);
  const [campTypes, setCampTypes] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState('');
  const [pathLabList, setPathLabList] = useState([]);
  const [selectedPathLab, setSelectedPathLab] = useState('');
  const [repList, setRepList] = useState([]);
  const [selectedRep, setSelectedRep] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const [selectedCampId, setSelectedCampId] = useState('');
  const [selectedPathlabId, setSelectedPathlabId] = useState('');
  const [selectedRepId, setSelectedRepId] = useState();
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch state first
        setIsLoading(true);
        await fetchState();
        await fetchCity();
        await fetchZone();
        await fetchRepList();
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Call fetchData function
    fetchData();
  }, []);

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
        setQuestions(data);
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
          placeholder="Type here"
        />
      </View>
    ));
  };

  // const fetchCampTypes = async () => {
  //   const ApiUrl = `${BASE_URL}${'/report/getCenterLIst'}`;
  //   try {
  //     const response = await fetch(ApiUrl, {
  //       method: 'GET',
  //     });

  //     const result = await response.json();

  //       console.log(result);
  //       setCampTypes(result);
  //       // Set default selected camp if needed
  //       // setSelectedCamp(result.data[0]?.camp_name || '');
  //       if (result.length > 0) {
  //         setSelectedCampId(result[0].cid);
  //         console.log("set centerid",result[0].cid);
  //     }

  //   } catch (error) {
  //     console.error('Error fetching camp types:', error.message);
  //   }
  // };

  const handleCampChange = (value, index) => {
    setSelectedCamp(value);
    setSelectedCampId(value);
    // Additional logic if needed when the camp selection changes
  };
  const fetchState = async () => {
    const ApiUrl = `${BASE_URL}${'/basic/getStates'}`;
    try {
      const response = await fetch(ApiUrl, {
        method: 'GET',
      });

      const result = await response.json();

      console.log(result);
      setState(result);
      // Set default selected camp if needed
      // setSelectedCamp(result.data[0]?.camp_name || '');
      if (result.length > 0) {
        await setSelectedStateId(result[0].id);
        console.log('set centerid', result[0].id);
      }
    } catch (error) {
      console.error('Error fetching State:', error.message);
    }
  };

  const handleStateChange = (value, index) => {
    setSelectedState(value);
    setSelectedStateId(value);
    fetchCity(value);
    console.log('selectedStateid', value);
  };
  const fetchCity = async value => {
    const payload = {stateId: !value ? 1 : value};
    setSelectedStateId(value);
    console.log('pay id', payload);
    console.log('SState id', selectedStateId);
    const ApiUrl = `${BASE_URL}${'/basic/getCities'}`;
    try {
      const response = await fetch(ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      console.log(result);
      setCity(result);
      // Set default selected camp if needed
      // setSelectedCamp(result.data[0]?.camp_name || '');
      if (result.length > 0) {
        setSelectedCityId(result[0].id);
        console.log('set centerid', result[0].id);
      }
    } catch (error) {
      console.error('Error fetching City:', error.message);
    }
  };

  const handleCityChange = (value, index) => {
    setSelectedCity(value);
    setSelectedCityId(value);
    // Additional logic if needed when the camp selection changes
  };
  const fetchZone = async () => {
    const ApiUrl = `${BASE_URL}${'/basic/getZone'}`;
    try {
      const response = await fetch(ApiUrl, {
        method: 'GET',
      });

      const result = await response.json();

      console.log(result);
      setZone(result);
      // Set default selected camp if needed
      // setSelectedCamp(result.data[0]?.camp_name || '');
      if (result.length > 0) {
        setSelectedZoneId(result[0].zone_id);
        console.log('set centerid', result[0].zone_id);
      }
    } catch (error) {
      console.error('Error fetching Zone:', error.message);
    }
  };

  const handleZoneChange = (value, index) => {
    setSelectedZone(value);
    setSelectedZoneId(value);
    console.log('selectedZoneid', value);

    // Additional logic if needed when the camp selection changes
  };

  const fetchRepList = async () => {
    try {
      const ApiUrl = `${BASE_URL}${'/report/getMrList'}`;
      const userDataString = await AsyncStorage.getItem('userdata');
      if (!userDataString) {
        console.log('No user data found in AsyncStorage');
        return;
      }

      const userData = JSON.parse(userDataString);
      const empcode = userData.responseData.empID;
      console.log('Empxo', empcode);
      const response = await fetch(ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empcode: empcode, // Example empcode, replace it with the actual value
        }),
      });

      const result = await response.json();
      console.log('R:', result);

      setRepList(result);
      if (result.length > 0) {
        setSelectedRepId(result[0].empcode);
        console.log('set empcode', result[0].empcode);
      }
    } catch (error) {
      console.log('Error fetching Rep2:', error.message);
    }
  };

  const handleRepChange = (value, index) => {
    setSelectedRep(value);
    setSelectedRepId(value);
    // Additional logic if needed when the path lab selection changes

    const selectedRepData = repList.find(rep => rep.empcode === value);

    // Update the selected pathlab email
    setRepname(selectedRepData ? selectedRepData.name : '');
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleItemSelect = item => {
    setSelectedItem(item);
    setTextInputValue(item);
    setIsDropdownVisible(false);
  };

  const filteredDropdownItems = dropdownItems.filter(item =>
    item.toLowerCase().includes(textInputValue.toLowerCase()),
  );
  const renderDropdownItem = ({item}) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleItemSelect(item)}>
      <Text>{item}</Text>
    </TouchableOpacity>
  );
  const handleTextInputChange = text => {
    setTextInputValue(text);
    // Filter the doctor names based on user input
    const filteredNames = doctorNames.filter(name =>
      name.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredDoctorNames(filteredNames);
    setIsDropdownVisible(!!text); // Hide the dropdown if text is empty
  };

  const handleDoctorSelect = name => {
    setSelectedDoctor(name);
    setTextInputValue(name);
    setIsDropdownVisible(false);
  };

  const handleCampDateChange = (event, selectedDate) => {
    setShowCampDatePicker(false);
    if (selectedDate) {
      // Parse the date string in "dd-mm-yyyy" format to create a new Date object
      const day = selectedDate.getDate();
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      const newDate = new Date(year, month - 1, day); // Month is 0-indexed

      setCampDate(newDate);
    }
  };
  const showCampDate = () => {
    setShowCampDatePicker(true);
  };
  const handleAddDoctor = () => {
    if (numDoctors < 4) {
      setNumDoctors(numDoctors + 1);
    }
  };

  const handleRemoveDoctor = () => {
    if (numDoctors > 1) {
      setNumDoctors(numDoctors - 1);
    }
  };
  const submitData = () => {
    if (
      Object.keys(selectedAnswers).length !== questions.length ||
      Object.values(selectedAnswers).some(answer => answer.trim() === '') ||
      !address
    ) {
      // Display an alert message if any required fields are empty
      alert('Please fill in all required fields');
      return;
    }
    // Fetch the userId from AsyncStorage
    setLoading(true);
    AsyncStorage.getItem('userdata')
      .then(data => {
        if (data) {
          const userData = JSON.parse(data);
          const userId = userData.responseData.user_id;

          // Define the payload using the retrieved userId
          const payload = {
            userId: userId, // Use the retrieved userId here
            subCatId: id,
            campDate: formattedCampDate,
            mrcode: selectedRepId,
            doc1: doctor1,
            doc2: doctor2,
            doc3: doctor3,
            doc4: doctor4,
            address: address,
            state: selectedStateId,
            city: selectedCityId,
            zone: selectedZoneId,
          };
          console.log('Payload after', payload);
          const ApiUrl = `${BASE_URL}${'/glaucomaReport/addReportWithInfo'}`;

          // Make the POST request
          return fetch(ApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
        } else {
          console.log('Invalid or missing data in AsyncStorage');
          return Promise.reject('Invalid or missing data in AsyncStorage');
        }
      })
      .then(response => response.json())
      .then(data => {
        // Handle the response from the API
        console.log('API Response:', data);

        // Check if the API request was successful
        if (data.errorCode === '1') {
          // Navigate to the "AddCampData" screen on success
          // navigation.navigate('GAddCampData', {crid: data.gcrid, id});
          submitData1(data.gcrid);
          console.log('navigation values', id);
        } else {
          // Handle any other logic or display an error message
          console.log('API Request was not successful');
          // Display an alert message for the user
          alert('API Request was not successful');
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error submitting data:', error);
        // Handle the error, e.g., display an error message to the user
        alert('Error submitting data. Please try again later.');
        setLoading(false);
      });
  };
  const submitData1 = crid => {
    console.log('Selected item', selectedItems);
    if (!selectedAnswers) {
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
                value: answer,
                user_id: userId, // Use the retrieved userId dynamically
              };
              dataArray.push(dataItem);
              console.log('all payload', dataItem);
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
                navigation.navigate('GUploadCampImages', {crid, id});
                console.log('forworded crid', crid);
                setLoading(false);
              } else {
                console.log('API Request was not successful');
                // Display an alert message for the user
                alert('Fill all the details');
                setLoading(false);
              }
              // After successfully submitting data, you can navigate to the next screen
            })
            .catch(error => {
              console.error('Error submitting data:', error);
              setLoading(false);
            });
        } else {
          console.log('Invalid or missing data in AsyncStorage');
          setLoading(false);
        }
      })
      .catch(error => {
        setLoading(false);
        console.error('Error retrieving data:', error);
      });
  };
  return (
    <LinearGradient colors={['#9cbddd', '#9cbddd']} style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000953" />
        </View>
      )}
      <ScrollView style={styles.container}>
        <View style={styles.form}>
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerLabel} onPress={showCampDate}>
              Select Date of Camp:
            </Text>
            <Button
              style={styles.datePickerButton}
              onPress={showCampDate}
              labelStyle={styles.addbtnText1}>
              {campDate.getDate().toString().padStart(2, '0')}-
              {(campDate.getMonth() + 1).toString().padStart(2, '0')}-
              {campDate.getFullYear()}
            </Button>
            {showCampDatePicker && (
              <DateTimePicker
                value={campDate}
                mode="date"
                is24Hour={true}
                display="default"
                dateFormat="DD-MM-YYYY"
                onChange={handleCampDateChange}
              />
            )}
          </View>

          <Text style={styles.datePickerLabel}>Select Name of MR:</Text>
          <View style={styles.pickcontainer}>
            <Picker
              selectedValue={selectedRep}
              style={styles.picker}
              onValueChange={(value, index) => handleRepChange(value, index)}>
              {repList.map((rep, index) => (
                <Picker.Item
                  key={rep.empcode}
                  label={rep.name}
                  value={rep.empcode}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.datePickerLabel}>Camp Address</Text>
          <TextInput
            // label="HQ"
            value={address}
            onChangeText={text => setAddress(text)}
            mode="outlined"
            style={styles.input}
            outlineColor="#000953"
            activeOutlineColor="#08a5d8"
            placeholder="Type here"
          />
          <Text style={styles.datePickerLabel}>State:</Text>
          <View style={styles.pickcontainer}>
            <Picker
              selectedValue={selectedState}
              style={styles.picker}
              onValueChange={(value, index) => handleStateChange(value, index)}>
              {state.map((state, index) => (
                <Picker.Item
                  key={state.id}
                  label={state.state_name}
                  value={state.id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.datePickerLabel}>City:</Text>
          <View style={styles.pickcontainer}>
            <Picker
              selectedValue={selectedCity}
              style={styles.picker}
              onValueChange={(value, index) => handleCityChange(value, index)}>
              {city.map((city, index) => (
                <Picker.Item
                  key={city.id}
                  label={city.city_name}
                  value={city.id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.datePickerLabel}>Zone:</Text>
          <View style={styles.pickcontainer}>
            <Picker
              selectedValue={selectedZone}
              style={styles.picker}
              onValueChange={(value, index) => handleZoneChange(value, index)}>
              {zone.map((zone, index) => (
                <Picker.Item
                  key={zone.zone_id}
                  label={zone.zone_name}
                  value={zone.zone_id}
                />
              ))}
            </Picker>
          </View>
          <Text style={styles.datePickerLabel}>Doctor 1 Name</Text>
          <TextInput
            // label="HQ"
            value={doctor1}
            onChangeText={text => setDoctor1(text)}
            mode="outlined"
            style={styles.input}
            outlineColor="#000953"
            activeOutlineColor="#08a5d8"
            placeholder="Type here"
          />
          {/* <Text style={styles.datePickerLabel}>Doctor 2 Name</Text>
          <TextInput
            // label="HQ"
            value={doctor2}
            onChangeText={text => setDoctor2(text)}
            mode="outlined"
            style={styles.input}
            outlineColor="#000953"
            activeOutlineColor="#08a5d8"
          />
          <Text style={styles.datePickerLabel}>Doctor 3 Name</Text>
          <TextInput
            // label="HQ"
            value={doctor3}
            onChangeText={text => setDoctor3(text)}
            mode="outlined"
            style={styles.input}
            outlineColor="#000953"
            activeOutlineColor="#08a5d8"
          />
          <Text style={styles.datePickerLabel}>Doctor 4 Name</Text>
          <TextInput
            // label="HQ"
            value={doctor4}
            onChangeText={text => setDoctor4(text)}
            mode="outlined"
            style={styles.input}
            outlineColor="#000953"
            activeOutlineColor="#08a5d8"
          /> */}
          {numDoctors >= 2 && (
            <>
              <Text style={styles.datePickerLabel}>Doctor 2 Name</Text>
              <TextInput
                // label="HQ"
                value={doctor2}
                onChangeText={text => setDoctor2(text)}
                mode="outlined"
                style={styles.input}
                outlineColor="#000953"
                activeOutlineColor="#08a5d8"
                placeholder="Type here"
              />
            </>
          )}
          {numDoctors >= 3 && (
            <>
              <Text style={styles.datePickerLabel}>Doctor 3 Name</Text>
              <TextInput
                // label="HQ"
                value={doctor3}
                onChangeText={text => setDoctor3(text)}
                mode="outlined"
                style={styles.input}
                outlineColor="#000953"
                activeOutlineColor="#08a5d8"
                placeholder="Type here"
              />
            </>
          )}
          {numDoctors >= 4 && (
            <>
              <Text style={styles.datePickerLabel}>Doctor 4 Name</Text>
              <TextInput
                // label="HQ"
                value={doctor4}
                onChangeText={text => setDoctor4(text)}
                mode="outlined"
                style={styles.input}
                outlineColor="#000953"
                activeOutlineColor="#08a5d8"
                placeholder="Type here"
              />
            </>
          )}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleAddDoctor}
              disabled={numDoctors >= 4}
              style={styles.addButton}>
              Add Doctor
            </Button>
            {numDoctors > 1 && (
              <Button
                mode="contained"
                onPress={handleRemoveDoctor}
                style={styles.removeButton}>
                Remove Doctor
              </Button>
            )}
          </View>

          {/* <Text style={styles.datePickerLabel}>Name of Doctor</Text>
          <View style={styles.inputContainer}>
            <TextInput
              backgroundColor="#fff"
              underlineColor="#fff"
              style={styles.inputField}
              outlineColor="#000953"
              theme={{
                ...DefaultTheme,
                colors: {
                  ...DefaultTheme.colors,
                  primary: '#000953', 
                },
              }}
              activeOutlineColor="#08a5d8"
              value={textInputValue}
              onChangeText={handleTextInputChange}
          
            />
            {isDropdownVisible && (
              <FlatList
                data={filteredDoctorNames}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleDoctorSelect(item)}>
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                style={styles.dropdownList}
              />
            )}
          </View> */}
          {renderQuestions()}
          <LinearGradient colors={['#000953', '#092d4f']} style={styles.addbtn}>
            <Button labelStyle={styles.addbtnText} onPress={submitData}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                'Next'
              )}
            </Button>
          </LinearGradient>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#0A8AFF',
  },
  removeButton: {
    backgroundColor: '#FF0000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Place it above other UI components
  },
  inputContainer: {
    borderColor: '#000953',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  inputField: {
    padding: 0,
    fontSize: 15,
  },
  dropdownList: {
    maxHeight: 150, // Set a max height for the dropdown list
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRadius: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  additionalInputLabel: {
    marginTop: 16,
    fontSize: 16,
  },
  additionalInput: {
    borderColor: '#000953',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
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
  addbtn: {
    backgroundColor: '#000953',
    paddingLeft: 1,
    paddingRight: 1,
    color: 'white',
    marginTop: 8,
    marginBottom: 50,
    borderRadius: 50,
  },
  addbtn1: {
    color: '#fff',
  },
  addbtnText: {
    color: '#fff', // Set the text color here
  },
  addbtnText1: {
    color: '#474747', // Set the text color here
  },
});

export default GAddCampReport;
