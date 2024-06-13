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

const OPAddCampReport = () => {
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
  const [doctor, setDoctor] = useState();
  const [institute, setInstitute] = useState();
  const [doctor3, setDoctor3] = useState();
  const [doctor4, setDoctor4] = useState();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [textInputValue, setTextInputValue] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dropdownItems] = useState(['Option 1', 'node', 'React']);
  const route = useRoute();
  const {id} = route.params;
  const formattedCampDate = format(campDate, 'dd-MM-yyyy');

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

  useEffect(() => {
    // Fetch data from API endpoint
    // fetchCampTypes();
    fetchRepList();
  }, []);

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

  const fetchRepList = async () => {
    try {
      const ApiUrl = `${BASE_URL}${'/operativeReport/getBrandName'}`;

      const response = await fetch(ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subCatId: id, // Example empcode, replace it with the actual value
        }),
      });

      const result = await response.json();
      console.log('R:', result);

      setRepList(result);
      if (result.length > 0) {
        setSelectedRepId(result[0].basic_id);
        console.log('set basic_id', result[0].basic_id);
      }
    } catch (error) {
      console.log('Error fetching Rep2:', error.message);
    }
  };

  const handleRepChange = (value, index) => {
    setSelectedRep(value);
    setSelectedRepId(value);
    // Additional logic if needed when the path lab selection changes

    const selectedRepData = repList.find(rep => rep.basic_id === value);

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
            campDate: formattedCampDate,
            campLocation: loction,
            brandId: selectedRepId,
            doctorName: doctor,
            hospitalName: institute,
          };
          console.log('Payload after', payload);
          const ApiUrl = `${BASE_URL}${'/operativeReport/addReportWithInfo'}`;

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
          navigation.navigate('OPUploadCampImages', {crid: data.ocrid, id});
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
    <LinearGradient colors={['#a6e9ff', '#a6e9ff']} style={styles.container}>
      {/* {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#383887" />
        </View>
      )} */}
      <ScrollView style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.datePickerLabel}>Select Brand Name:</Text>
          <View style={styles.pickcontainer}>
            <Picker
              selectedValue={selectedRep}
              style={styles.picker}
              onValueChange={(value, index) => handleRepChange(value, index)}>
              {repList.map((rep, index) => (
                <Picker.Item
                  key={rep.basic_id}
                  label={rep.description}
                  value={rep.basic_id}
                />
              ))}
            </Picker>
          </View>
          <Text style={styles.datePickerLabel}>Doctor Name</Text>
          <TextInput
            // label="HQ"
            value={doctor}
            onChangeText={text => setDoctor(text)}
            mode="outlined"
            style={styles.input}
            outlineColor="#383887"
            activeOutlineColor="#08a5d8"
          />
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerLabel} onPress={showCampDate}>
              Select Date of Entry:
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
          <Text style={styles.datePickerLabel}>Institute / Hospital Name</Text>
          <TextInput
            // label="HQ"
            value={institute}
            onChangeText={text => setInstitute(text)}
            mode="outlined"
            style={styles.input}
            outlineColor="#383887"
            activeOutlineColor="#08a5d8"
          />
          <Text style={styles.datePickerLabel}>Location</Text>
          <TextInput
            // label="HQ"
            value={loction}
            onChangeText={text => setLocation(text)}
            mode="outlined"
            style={styles.input}
            outlineColor="#383887"
            activeOutlineColor="#08a5d8"
          />
          <LinearGradient colors={['#383887', '#092d4f']} style={styles.addbtn}>
            <Button labelStyle={styles.addbtnText} onPress={submitData}>
              Next
            </Button>
          </LinearGradient>
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

export default OPAddCampReport;
