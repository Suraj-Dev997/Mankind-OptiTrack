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

const AddCampReport = () => {
  const [doctorNames, setDoctorNames] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [filteredDoctorNames, setFilteredDoctorNames] = useState([]);
  const [qualification, setQualification] = useState('');
  const [avatarUri, setAvatarUri] = useState(null); // To store the URI of the selected image
  const [campDate, setCampDate] = useState(new Date());
  const [showCampDatePicker, setShowCampDatePicker] = useState(false);
  const [hq, setHq] = useState();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [textInputValue, setTextInputValue] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dropdownItems] = useState(['Option 1', 'node', 'React']);
  const route = useRoute();
  const {id} = route.params;
  const formattedCampDate = format(campDate, 'dd-MM-yyyy');
  const [mrNames, setMrNames] = useState([]); // State to store MR names
  const initialSelectedMr = 'Name of MR';
  const [selectedMr, setSelectedMr] = useState(initialSelectedMr);
  const [mrHQs, setMrHQs] = useState({}); // Store MR HQs
  const [selectedMrInfo, setSelectedMrInfo] = useState({
    empcode: '',
    hq: '',
    name: '',
  });
  const [mrData, setMrData] = useState([]);
  const [role, setRole] = useState([]);

  const [showTLDropdown, setShowTLDropdown] = useState(true);
  const [showSLDropdown, setShowSLDropdown] = useState(true);
  const [showFLDropdown, setShowFLDropdown] = useState(true);

  const [tlNames, setTLNames] = useState([]); // State to store TL names
  const [initialSelectedTL, setInitialSelectedTL] = useState('Name of TL');
  const [selectedTL, setSelectedTL] = useState(initialSelectedTL);
  const [tlHQs, setTLHQs] = useState({}); // Store TL HQs
  const [selectedTLInfo, setSelectedTLInfo] = useState({
    empcode: '',
    hq: '',
    name: '',
  });
  const [tlData, setTLData] = useState([]);

  const [slNames, setSLNames] = useState([]); // State to store SL names
  const [initialSelectedSL, setInitialSelectedSL] = useState('Name of SL');
  const [selectedSL, setSelectedSL] = useState(initialSelectedSL);
  const [slHQs, setSLHQs] = useState({}); // Store SL HQs
  const [selectedSLInfo, setSelectedSLInfo] = useState({
    empcode: '',
    hq: '',
    name: '',
  });
  const [slData, setSLData] = useState([]);

  const [flNames, setFLNames] = useState([]); // State to store FL names
  const [initialSelectedFL, setInitialSelectedFL] = useState('Name of FL');
  const [selectedFL, setSelectedFL] = useState(initialSelectedFL);
  const [flHQs, setFLHQs] = useState({}); // Store FL HQs
  const [selectedFLInfo, setSelectedFLInfo] = useState({
    empcode: '',
    hq: '',
    name: '',
  });
  const [flData, setFLData] = useState([]);

  useEffect(() => {
    // Inside the useEffect, retrieve data from AsyncStorage
    AsyncStorage.getItem('userdata')
      .then(data => {
        if (data !== null) {
          const userData = JSON.parse(data);
          setRole(userData.responseData.role);
          const empcode = userData.responseData.role;
          console.log('Retrieved data-------------:', empcode);
        } else {
          // Data not found
          console.log('No data found with the key "userdata".');
        }
      })
      .catch(error => {
        // Handle errors here
        console.error('Error retrieving data:', error);
      });
  }, []);

  useEffect(() => {
    // ... Your other code ...

    // Assuming the user's role is stored in the state variable 'role'
    switch (role) {
      case 3:
        // Role 3: All dropdowns are visible
        setShowTLDropdown(true);
        setShowSLDropdown(true);
        setShowFLDropdown(true);
        break;
      case 4:
        // Role 4: TL dropdown is hidden
        setShowTLDropdown(false);
        setShowSLDropdown(true);
        setShowFLDropdown(true);
        break;
      case 5:
        // Role 5: TL and SL dropdowns are hidden
        setShowTLDropdown(false);
        setShowSLDropdown(false);
        setShowFLDropdown(true);
        break;
      case 6:
        // Role 6: TL, SL, and FL dropdowns are hidden
        setShowTLDropdown(false);
        setShowSLDropdown(false);
        setShowFLDropdown(false);
        break;
      default:
        // Handle other cases here
        break;
    }
  }, [role]);

  const fetchTLData = empcode => {
    setIsLoading(true);
    // Replace 'API_URL_FOR_TL' with the actual API endpoint for TL data
    const ApiUrl = `${BASE_URL}${'/report/getEmpData'}`;

    fetch(ApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        empcode: empcode,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('TL data:', data);
        if (data) {
          // Extract TL names and HQs from the API response
          const tlData = data.map(tl => ({
            name: tl.name,
            hq: tl.hq,
            empcode: tl.empcode,
          }));

          const tlHQs = {};
          tlData.forEach(tl => {
            tlHQs[tl.name] = tl.hq;
          });

          // Set the TL data, TL names, and their respective HQs in the state
          setTLData(tlData);
          setTLNames(tlData.map(tl => tl.name));
          setTLHQs(tlHQs);

          // Set the selected TL and HQ based on the initial TL (e.g., the first TL)
          const initialSelectedTL = tlData[0]?.name || '';
          setSelectedTL(initialSelectedTL);
          setHq(tlHQs[initialSelectedTL] || '');

          // Set selected TL's information in the state
          setSelectedTLInfo(tlData[0] || {});
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.error('Error fetching TL names and HQs:', error);
        setIsLoading(false);
      });
  };

  // Function to fetch SL data
  const fetchSLData = empcode => {
    setIsLoading(true);
    // Replace 'API_URL_FOR_SL' with the actual API endpoint for SL data
    const ApiUrl = `${BASE_URL}${'/report/getEmpData'}`;

    fetch(ApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        empcode: empcode,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('SL data:', data);
        if (data) {
          // Extract SL names and HQs from the API response
          const slData = data.map(sl => ({
            name: sl.name,
            hq: sl.hq,
            empcode: sl.empcode,
          }));

          const slHQs = {};
          slData.forEach(sl => {
            slHQs[sl.name] = sl.hq;
          });

          // Set the SL data, SL names, and their respective HQs in the state
          setSLData(slData);
          setSLNames(slData.map(sl => sl.name));
          setSLHQs(slHQs);

          // Set the selected SL and HQ based on the initial SL (e.g., the first SL)
          const initialSelectedSL = slData[0]?.name || '';
          setSelectedSL(initialSelectedSL);
          setHq(slHQs[initialSelectedSL] || '');

          // Set selected SL's information in the state
          setSelectedSLInfo(slData[0] || {});
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.error('Error fetching SL names and HQs:', error);
        setIsLoading(false);
      });
  };

  // Function to fetch FL data
  const fetchFLData = empcode => {
    setIsLoading(true);
    // Replace 'API_URL_FOR_FL' with the actual API endpoint for FL data
    const ApiUrl = `${BASE_URL}${'/report/getEmpData'}`;

    fetch(ApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        empcode: empcode,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('FL data:', data);
        if (data) {
          // Extract FL names and HQs from the API response
          const flData = data.map(fl => ({
            name: fl.name,
            hq: fl.hq,
            empcode: fl.empcode,
          }));

          const flHQs = {};
          flData.forEach(fl => {
            flHQs[fl.name] = fl.hq;
          });

          // Set the FL data, FL names, and their respective HQs in the state
          setFLData(flData);
          setFLNames(flData.map(fl => fl.name));
          setFLHQs(flHQs);

          // Set the selected FL and HQ based on the initial FL (e.g., the first FL)
          const initialSelectedFL = flData[0]?.name || '';
          setSelectedFL(initialSelectedFL);
          setHq(flHQs[initialSelectedFL] || '');

          // Set selected FL's information in the state
          setSelectedFLInfo(flData[0] || {});
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.error('Error fetching FL names and HQs:', error);
        setIsLoading(false);
      });
  };
  useEffect(() => {
    const fetchMRData = empcode => {
      setIsLoading(true);
      const ApiUrl = `${BASE_URL}${'/report/getEmpData'}`;
      fetch(ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empcode: empcode,
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('data getting', data);
          if (data) {
            // Extract MR names and HQs from the API response
            const mrData = data.map(mr => ({
              name: mr.name,
              hq: mr.hq,
              empcode: mr.empcode, // Include empcode in the MR data
            }));

            // Create an object to store MR names and their respective HQs
            const mrHQs = {};
            mrData.forEach(mr => {
              mrHQs[mr.name] = mr.hq;
            });

            // Set the MR data, MR names, and their respective HQs in the state
            setMrData(mrData);
            setMrNames(mrData.map(mr => mr.name));
            setMrHQs(mrHQs);

            // Set the selected MR and HQ based on the initial MR (e.g., the first MR)
            const initialSelectedMr = mrData[0]?.name || '';
            setSelectedMr(initialSelectedMr);
            setHq(mrHQs[initialSelectedMr] || '');

            // Set selected MR's information in the state
            setSelectedMrInfo(mrData[0] || {});
            setIsLoading(false);
          }
        })
        .catch(error => {
          console.error('Error fetching MR names and HQs:', error);
          setIsLoading(false);
        });
    };

    AsyncStorage.getItem('userdata')
      .then(data => {
        if (data) {
          const userData = JSON.parse(data);
          const empcode = userData.responseData.empID;
          // Call fetchData with the retrieved userId
          console.log('Getting user id:', empcode);
          fetchMRData(empcode);
        } else {
          console.log('Invalid or missing data in AsyncStorage');
        }
      })
      .catch(error => {
        console.error('Error retrieving data:', error);
      });
    fetchMRData();
  }, []);

  const handleMrChange = itemValue => {
    setSelectedMr(itemValue);

    // Get the HQ for the selected MR from the mrHQs object
    const selectedMrHQ = mrHQs[itemValue];
    setHq(selectedMrHQ || ''); // Set HQ based on selected MR

    // Find the MR info for the selected MR
    const selectedMrInfo = mrData.find(mr => mr.name === itemValue) || {};

    // Update the selectedMrInfo state with the new MR info
    setSelectedMrInfo(selectedMrInfo);
  };

  useEffect(() => {
    // Fetch doctor names from the API
    const ApiUrl = `${BASE_URL}${'/doc/getDoctorWithUserId'}`;

    // Fetch the userId from AsyncStorage
    AsyncStorage.getItem('userdata')
      .then(data => {
        if (data) {
          const userData = JSON.parse(data);
          const userId = userData.responseData.user_id;

          // Call fetchData with the retrieved userId
          console.log('Getting user id:', userId);

          // Fetch data using the retrieved userId
          return fetch(ApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId, // Use the retrieved userId here
              subCatId: id,
            }),
          });
        } else {
          console.log('Invalid or missing data in AsyncStorage');
        }
      })
      .then(response => {
        if (!response) {
          return; // Return early if there was an issue with AsyncStorage
        }
        return response.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Extract doctor names from the response
          console.log(data);
          const names = data.map(doctor => doctor.doctor_name);
          setDoctorNames(names);
          console.log(names);
        }
      })
      .catch(error => {
        console.error('Error fetching doctor names:', error);
      });
  }, [id]);

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

  const findDoctor = async () => {
    // Check if any required fields are empty
    if (!selectedMr || !textInputValue || !formattedCampDate) {
      // Display an alert message if any required fields are empty
      alert('Please fill in all required fields');
      return;
    }
    try {
      const ApiUrl = `${BASE_URL}${'/report/findDoctorPresent'}`;
      const response = await fetch(ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: textInputValue,
          date: formattedCampDate,
          empcode: selectedMrInfo.empcode || '',
        }),
      });

      const data = await response.json();

      if (data.errorCode === '1') {
        console.log('Doctor found');
        Alert.alert(
          'Info',
          'Doctor already present with same MR and same date, Please change MR or Date ',
          [{text: 'OK', onPress: () => 'Ok Pressed'}],
        );
      } else {
        console.log('Doctor not found');
        submitData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const submitData = () => {
    // Fetch the userId from AsyncStorage
    AsyncStorage.getItem('userdata')
      .then(data => {
        if (data) {
          const userData = JSON.parse(data);
          const userId = userData.responseData.user_id;

          // Define the payload using the retrieved userId
          const payload = {
            userId: userId, // Use the retrieved userId here
            subCatId: id,
            empcode: selectedMrInfo.empcode || '',
            doctorName: textInputValue,
            campDate: formattedCampDate,
          };
          console.log('Payload after', payload);
          const ApiUrl = `${BASE_URL}${'/report/addReportWithInfo'}`;

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
          navigation.navigate('AddCampData', {crid: data.crid, id});
          console.log('navigation values', id);
        } else {
          // Handle any other logic or display an error message
          console.log('API Request was not successful');
          // Display an alert message for the user
          alert('API Request was not successful');
        }
      })
      .catch(error => {
        console.error('Error submitting data:', error);
        // Handle the error, e.g., display an error message to the user
        alert('Error submitting data. Please try again later.');
      });
  };

  return (
    <LinearGradient colors={['#383887', '#a6e9ff']} style={styles.container}>
      <ScrollView>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#383887" />
          </View>
        )}
        <View style={styles.container}>
          <View style={styles.form}>
            {showTLDropdown && (
              <View>
                <Text style={styles.datePickerLabel}>Select Name of TL:</Text>
                <View style={styles.pickcontainer}>
                  <Picker
                    selectedValue={selectedMr}
                    style={styles.picker}
                    onValueChange={handleMrChange}>
                    {mrNames.map((name, index) => (
                      <Picker.Item key={index} label={name} value={name} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
            {showSLDropdown && (
              <View>
                <Text style={styles.datePickerLabel}>Select Name of SL:</Text>
                <View style={styles.pickcontainer}>
                  <Picker
                    selectedValue={selectedMr}
                    style={styles.picker}
                    onValueChange={handleMrChange}>
                    {mrNames.map((name, index) => (
                      <Picker.Item key={index} label={name} value={name} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
            {showFLDropdown && (
              <View>
                <Text style={styles.datePickerLabel}>Select Name of FL:</Text>
                <View style={styles.pickcontainer}>
                  <Picker
                    selectedValue={selectedMr}
                    style={styles.picker}
                    onValueChange={handleMrChange}>
                    {mrNames.map((name, index) => (
                      <Picker.Item key={index} label={name} value={name} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
            <Text style={styles.datePickerLabel}>Select Name of MR:</Text>
            <View style={styles.pickcontainer}>
              <Picker
                selectedValue={selectedMr}
                style={styles.picker}
                onValueChange={handleMrChange}>
                {mrNames.map((name, index) => (
                  <Picker.Item key={index} label={name} value={name} />
                ))}
              </Picker>
            </View>
            <Text style={styles.datePickerLabel}>Name of Doctor</Text>
            <View style={styles.inputContainer}>
              <TextInput
                backgroundColor="#fff"
                underlineColor="#fff"
                style={styles.inputField}
                outlineColor="#383887"
                theme={{
                  ...DefaultTheme,
                  colors: {
                    ...DefaultTheme.colors,
                    primary: '#383887', // Change the label color to blue
                  },
                }}
                activeOutlineColor="#08a5d8"
                value={textInputValue}
                onChangeText={handleTextInputChange}
                // label="Name of Doctor"
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
            </View>

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
            <Text style={styles.datePickerLabel}>HQ</Text>
            <TextInput
              // label="HQ"
              value={hq}
              onChangeText={text => setHq(text)}
              mode="outlined"
              style={styles.input}
              outlineColor="#383887"
              activeOutlineColor="#08a5d8"
              editable={false}
            />
            <LinearGradient
              colors={['#383887', '#092d4f']}
              style={styles.addbtn}>
              <Button onPress={findDoctor} labelStyle={styles.addbtnText}>
                Next
              </Button>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
    borderColor: '#383887',
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
    borderColor: '#383887',
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
    borderColor: '#383887',
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    // backgroundColor:'#fff',
    width: '100%',
    borderWidth: 1,
    borderColor: '#383887',
    borderRadius: 5,
    padding: 0,
  },
  datePickerLabel: {
    fontSize: 14, // You can adjust the font size as needed
    marginBottom: 0, // Spacing between label and button
    color: '#383887',
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
    borderColor: '#383887',
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
    color: '#383887',
    textAlign: 'center',
  },
  addbtn: {
    backgroundColor: '#383887',
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
  addbtnText1: {
    color: '#474747', // Set the text color here
  },
});

export default AddCampReport;
