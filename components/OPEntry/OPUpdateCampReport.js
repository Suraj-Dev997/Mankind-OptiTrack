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
  _ScrollView,
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

const OPUpdateCampReport = () => {
  const [doctorNames, setDoctorNames] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [filteredDoctorNames, setFilteredDoctorNames] = useState([]);
  const [qualification, setQualification] = useState('');
  const [avatarUri, setAvatarUri] = useState(null); // To store the URI of the selected image
  const [campDate, setCampDate] = useState(new Date());
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
  const {id, crId} = route.params;
  const formattedCampDate = format(campDate, 'dd-MM-yyyy');
  const [mrNames, setMrNames] = useState([]); // State to store MR names
  const [centerNames, setCenterNames] = useState([]); // State to store MR names
  const initialSelectedMr = 'Name of MR';

  const [selectedMr, setSelectedMr] = useState();
  const [selectedCenter, setSelectedCenter] = useState('');

  const [mrHQs, setMrHQs] = useState({}); // Store MR HQs
  const [selectedMrInfo, setSelectedMrInfo] = useState({
    empcode: '',
    hq: '',
    name: '',
  });
  const [selectedCenterInfo, setSelectedCenterInfo] = useState({
    cid: '',
    center_name: '',
  });
  const [mrData, setMrData] = useState([]);
  const [centerData, setCenterData] = useState([]);

  const fetchMrData = async () => {
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

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const names = data.map(mr => mr.description);

        setMrNames(names);

        setMrData(data);

        return data;
      }
    } catch (error) {
      console.error('Error fetching MR data:', error);
    }
  };
  const fetchCenterData = async () => {
    try {
      const ApiUrl = `${BASE_URL}${'/report/getCenterLIst'}`;
      const response = await fetch(ApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const centers = data.map(({cid, center_name}) => ({cid, center_name}));
        setCenterData(centers);
        const names = centers.map(center => center.center_name);
        setCenterNames(names);

        return centers;
      }
    } catch (error) {
      console.error('Error fetching MR data:', error);
    }
  };

  const parseDateFromString = dateString => {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  useEffect(() => {
    // Fetch data from API endpoints
    const fetchCampData = async () => {
      try {
        await Promise.all([fetchMrData(), fetchCenterData()]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchCampData();
  }, []);

  useEffect(() => {
    const fetchReportInfo = async () => {
      // const {crId} = route.params;

      const apiUrl = `${BASE_URL}/operativeReport/getReportInfoWithId`;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orId: crId,
          }),
        });

        const result = await response.json();

        if (result && result.length > 0) {
          setIsLoading(true);
          const reportInfo = result[0];

          const campDate = parseDateFromString(reportInfo.camp_date);
          // setSelectedCamp(reportInfo.camp_name);
          // setSelectedPathLab(reportInfo.pathlab_name);
          // setSelectedDoctor(reportInfo.doctor_name);
          setCampDate(campDate);
          setCampName(reportInfo.camp_name);
          setLocation(reportInfo.camp_location);
          setDoctor(reportInfo.doctor_name);
          setInstitute(reportInfo.hospital_name);

          // setUserEmpcode(reportInfo.empcode);
          // setUserEmpcodefl(reportInfo.empcode);

          const selectedCampValue = centerData.find(camp => {
            return camp.cid === parseInt(reportInfo.camp_center);
          });

          setSelectedCenter(selectedCampValue?.cid || '');

          const selectedMrValue = mrData.find(mr => {
            return mr.basic_id === reportInfo.brand_name;
          });

          setSelectedMr(selectedMrValue?.basic_id || '');
        } else {
          console.log('Error fetching report info:', result.message);
        }
      } catch (error) {
        console.log('Error fetching report info:', error.message);
      } finally {
        // Set loading to false after fetching data
        setIsLoading(false);
      }
    };
    fetchReportInfo();
  }, [centerData, crId, mrData]);

  const handleMrChange = itemValue => {
    setSelectedMr(itemValue);

    // Find the MR info for the selected MR
    const selectedMrInfo = mrData.find(mr => mr.name === itemValue) || {};

    // Update the selectedMrInfo state with the new MR info
    setSelectedMrInfo(selectedMrInfo);
  };

  const handleCenterChange = itemValue => {
    setSelectedCenter(itemValue);

    // Find the MR info for the selected MR
    const selectedCenterInfo =
      centerData.find(mr => mr.center_name === itemValue) || {};

    // Update the selectedMrInfo state with the new MR info
    setSelectedCenterInfo(selectedCenterInfo);
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
            campLocation: loction,
            brandId: selectedMr,
            doctorName: doctor,
            campDate: formattedCampDate,
            hospitalName: institute,
            orId: crId,
          };
          console.log('Payload after', payload);
          console.log('another details', selectedMr);
          console.log('another details', selectedCenter);
          const ApiUrl = `${BASE_URL}${'/operativeReport/updateReportWithInfo'}`;

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
          navigation.navigate('OPUpdateCampImages', {crid: crId, id});
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
    <LinearGradient colors={['#9cbddd', '#9cbddd']} style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000953" />
        </View>
      )}
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.form}>
            <Text style={styles.datePickerLabel}>Select Brand Name:</Text>
            <View style={styles.pickcontainer}>
              <Picker
                selectedValue={selectedMr}
                style={styles.picker}
                onValueChange={handleMrChange}>
                {mrData.map((mr, index) => (
                  <Picker.Item
                    key={mr.basic_id}
                    label={mr.description}
                    value={mr.basic_id}
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
              outlineColor="#000953"
              activeOutlineColor="#08a5d8"
              placeholder='Type here'
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
            <Text style={styles.datePickerLabel}>
              Institute / Hospital Name
            </Text>
            <TextInput
              // label="HQ"
              value={institute}
              onChangeText={text => setInstitute(text)}
              mode="outlined"
              style={styles.input}
              outlineColor="#000953"
              activeOutlineColor="#08a5d8"
              placeholder='Type here'
            />
            <Text style={styles.datePickerLabel}>Location</Text>
            <TextInput
              // label="HQ"
              value={loction}
              onChangeText={text => setLocation(text)}
              mode="outlined"
              style={styles.input}
              outlineColor="#000953"
              activeOutlineColor="#08a5d8"
              placeholder='Type here'
            />

            <LinearGradient
              colors={['#000953', '#092d4f']}
              style={styles.addbtn}>
              <Button onPress={submitData} labelStyle={styles.addbtnText}>
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

export default OPUpdateCampReport;
