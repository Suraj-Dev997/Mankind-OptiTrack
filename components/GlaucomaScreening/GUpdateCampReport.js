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

const GUpdateCampReport = () => {
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [doctorNames, setDoctorNames] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [filteredDoctorNames, setFilteredDoctorNames] = useState([]);
  const [qualification, setQualification] = useState('');
  const [avatarUri, setAvatarUri] = useState(null); // To store the URI of the selected image
  const [campDate, setCampDate] = useState(new Date());
  const [showCampDatePicker, setShowCampDatePicker] = useState(false);
  const [campname, setCampName] = useState();
  const [centername, setCenterName] = useState('');
  const [address, setAddress] = useState();
  const [loading, setLoading] = useState(false);
  const [doctor1, setDoctor1] = useState();
  const [doctor2, setDoctor2] = useState();
  const [doctor3, setDoctor3] = useState();
  const [doctor4, setDoctor4] = useState();
  const [city, setCity] = useState([]);
  const [state, setState] = useState([]);
  const [zone, setZone] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
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
  const [doctors, setDoctors] = useState(['']);
  const [selectedMr, setSelectedMr] = useState();
  const [selectedCenter, setSelectedCenter] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
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

  useEffect(() => {
    fetchCampData();
  }, []);

  useEffect(() => {
    fetchReportInfo();
  }, [centerData, city, crId, mrData, selectedState, state, zone]);

  const fetchCampData = async () => {
    try {
      setIsLoading(true)
      await Promise.all([fetchMrData(), fetchCenterData(),fetchState(),fetchReportAndCity(),fetchZone()]);
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchReportAndCity = async (value) => {
    setIsLoading(true)
    const apiUrl = `${BASE_URL}/glaucomaReport/getReportInfoWithId`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grId: crId,
        }),
      });

      const result = await response.json();

      if (result && result.length > 0) {
        setIsLoading(true);
        const reportInfo = result[0];

        const stateId = parseInt(reportInfo.state_id);
        setSelectedStateId(stateId);
        console.log("seted stid", stateId);
        
        // Fetch city information
        const cityPayload = { stateId: !value ? stateId:value};
        const cityApiUrl = `${BASE_URL}/basic/getCities`;

        try {
          const cityResponse = await fetch(cityApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cityPayload),
          });

          const cityResult = await cityResponse.json();

          console.log(cityResult);
          setCity(cityResult);

          if (cityResult.length > 0) {
            setSelectedCityId(cityResult[0].id);
            console.log('set centerid', cityResult[0].id);
          }
        } catch (cityError) {
          console.error('Error fetching City:', cityError.message);
        }

        setIsLoading(false);
      } else {
        console.log('Error fetching report info:', result.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.log('Error fetching report info:', error.message);
      setIsLoading(false);
    }
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

//   const handleStateChange = (value, index) => {
//     setSelectedState(value);
//     setSelectedStateId(value);
//   fetchReportAndCity(value);
//     console.log("selectedStateid",value);
    
   
// };



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
    console.log("selectedZoneid",value);
 
   
    // Additional logic if needed when the camp selection changes
  };
  useEffect(() => {
    // Fetch data from the API
    const ApiUrl = `${BASE_URL}/report/getAnswerWithId`;
    fetch(ApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        crId: crId, // Update with the correct crId
        subCatId: id,
      }),
    })
      .then(response => response.json())
      .then(data => {
        // Extract answers and brand_id from the API response
        const answers = {};
        let selectedBrandId = 'option1'; // Default value for brand if no data is available

        if (data.length > 0) {
          selectedBrandId = data?.brand_id?.split(',')?.map(Number) || []; // Use the brand_id from the first item in the response
          data.forEach(item => {
            answers[item.rqid] = item.answer.toString(); // Store answers in an object
          });
        }

        // Update state variables with the fetched data
        console.log('Brand ids::::::::', selectedBrandId);
        setSelectedAnswers(answers);
        setSelectedItems(selectedBrandId);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [crId, id]);
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
          placeholder='Type here'
        />
      </View>
    ));
  };

  const fetchMrData = async () => {
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

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const names = data.map(mr => mr.name);

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
  const fetchReportInfo = async () => {
    if (isDataFetched) return;
    // const {crId} = route.params;
    setIsLoading(true);
    const apiUrl = `${BASE_URL}/glaucomaReport/getReportInfoWithId`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grId: crId,
        }),
      });

      const result = await response.json();

      if (result && result.length > 0) {
   
        const reportInfo = result[0];

        const campDate = parseDateFromString(reportInfo.camp_date);
        // setSelectedCamp(reportInfo.camp_name);
        // setSelectedPathLab(reportInfo.pathlab_name);
        // setSelectedDoctor(reportInfo.doctor_name);
        setCampDate(campDate);
        setCampName(reportInfo.camp_name);
        setAddress(reportInfo.address);
        setSelectedState(parseInt(reportInfo.state_id))
        const doctorFields = [
          reportInfo.doc_name1,
          reportInfo.doc_name2,
          reportInfo.doc_name3,
          reportInfo.doc_name4,
        ].filter(Boolean); // Remove empty strings
        setDoctors(doctorFields);

        // setUserEmpcode(reportInfo.empcode);
        // setUserEmpcodefl(reportInfo.empcode);

        const selectedCampValue = centerData.find(camp => {
          return camp.cid === parseInt(reportInfo.camp_center);
        });

        setSelectedCenter(selectedCampValue?.cid || '');

        const selectedMrValue = mrData.find(mr => {
          return mr.empcode === String(reportInfo.mr_code);
        });

        setSelectedMr(selectedMrValue?.empcode || '');

        const selectedStateValue = state.find(state => state.id == parseInt(reportInfo.state_id));
     
        console.log("selected state:", selectedStateValue?.id);
        setSelectedState(selectedStateValue?.id|| '');
      
        const selectedCityValue = city.find(city => city.id == parseInt(reportInfo.city_id));
        console.log("sta",city);
        console.log("rpst",reportInfo.city_id);
        console.log(typeof(reportInfo.city_id));
        console.log("selected city:", selectedCityValue?.id);
        setSelectedCity(selectedCityValue?.id || '');
  
        // Find and set the selected zone
        const selectedZoneValue = zone.find(zone => zone.zone_id == parseInt(reportInfo.zone_id));
        console.log("selected zone:", selectedZoneValue?.zone_id);
        setSelectedZone(selectedZoneValue?.zone_id || '');
     

        if (
          selectedStateValue?.id &&
          selectedCityValue?.id &&
          selectedZoneValue?.zone_id &&
          selectedMrValue?.empcode &&
          selectedStateValue.id !== '' &&
          selectedCityValue.id !== '' &&
          selectedZoneValue.zone_id !== '' &&
          selectedMrValue.empcode !== '' 
        ) {
          setIsDataFetched(true);
        }
        setIsLoading(false);
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

  const handleStateChange = (itemValue) => {
    setSelectedState(itemValue);
  
    // Find the MR info for the selected MR based on empcode
    const selectedStateInfo = state.find(mr => mr.id === itemValue) || {};
    fetchReportAndCity(itemValue);
  
    
  };

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
    setLoading(true);
    AsyncStorage.getItem('userdata')
      .then(data => {
        if (data) {
          const userData = JSON.parse(data);
          const userId = userData.responseData.user_id;

          // Define the payload using the retrieved userId
          const payload = {
            userId: userId, // Use the retrieved userId here
            campName: campname,
            address:address,
            state:selectedState,
            city: selectedCity,
            zone:selectedZone,
            campCenter: selectedCenter,
            mrcode: selectedMr,
            doc1: doctors[0] || '',
        doc2: doctors[1] || '',
        doc3: doctors[2] || '',
        doc4: doctors[3] || '',
            campDate: formattedCampDate,
            grId: crId,
          };
          console.log('Payload after', payload);
          console.log('another details', selectedMr);
          console.log('another details', selectedCenter);
          const ApiUrl = `${BASE_URL}${'/glaucomaReport/updateReportWithInfo'}`;

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
          setLoading(false);
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
          // navigation.navigate('GUpdateCampData', {crid: crId, id});
          console.log('navigation values', id);
          submitData1();
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
        setLoading(false);
        // Handle the error, e.g., display an error message to the user
        alert('Error submitting data. Please try again later.');
      });
  };

  const submitData1 = () => {
    // Retrieve the userId from AsyncStorage
    AsyncStorage.getItem('userdata')
      .then(data => {
        if (data) {
          const userData = JSON.parse(data);
          const userId = userData.responseData.user_id;

          const selectedItemsString = selectedItems.join(',');
          // Create an array to store the payload data dynamically
          const dataArray = [];

          // Loop through selectedAnswers to create the payload
          for (const rqid in selectedAnswers) {
            if (selectedAnswers.hasOwnProperty(rqid)) {
              const answer = selectedAnswers[rqid];
              const dataItem = {
                rqid: rqid,
                crid: crId,
                subcat_id: id,
                value: answer,
                user_id: userId, // Use the retrieved userId dynamically
              };
              dataArray.push(dataItem);
            }
          }
          const ApiUrl = `${BASE_URL}${'/report/updateAnswer'}`;
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
                navigation.navigate('GUpdateCampImages', {crid: crId, id});
                console.log('forworded crid',crId);
                setLoading(false);
              } else {
                // Handle any other logic or display an error message
                console.error('API Request was not successful');
                // You can also display an error message to the user
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
        console.error('Error retrieving data:', error);
        setLoading(false);
      });
  };
  const handleDoctorChange = (text, index) => {
    const newDoctors = [...doctors];
    newDoctors[index] = text;
    setDoctors(newDoctors);
  };

  const addDoctorField = () => {
    setDoctors([...doctors, '']);
  };

  const removeDoctorField = index => {
    if (doctors.length > 1) {
      const newDoctors = doctors.filter((_, i) => i !== index);
      setDoctors(newDoctors);
    }
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
                selectedValue={selectedMr}
                style={styles.picker}
                onValueChange={handleMrChange}>
                {mrData.map((mr, index) => (
                  <Picker.Item
                    key={mr.empcode}
                    label={mr.name}
                    value={mr.empcode}
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
            placeholder='Type here'
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
             {doctors.map((doctor, index) => (
  <View key={index} >
  <Text style={styles.datePickerLabel}>{`Doctor ${index + 1} Name:`}</Text>
 <View style={styles.doctorContainer}>
    <View style={styles.inputContainer1}>
      <TextInput
        value={doctor}
        onChangeText={(text) => handleDoctorChange(text, index)}
        mode="outlined"
        style={styles.input1}
        outlineColor="#000953"
        activeOutlineColor="#08a5d8"
        placeholder='Type here'
      />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeDoctorField(index)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  </View>
  </View>
  
))}
<TouchableOpacity style={styles.addButton} onPress={addDoctorField}>
              <Text style={styles.addButtonText}>Add Doctor</Text>
            </TouchableOpacity>
            {renderQuestions()}
            <LinearGradient
              colors={['#000953', '#092d4f']}
              style={styles.addbtn}>
              <Button onPress={submitData} labelStyle={styles.addbtnText}>
              {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    'Next'
                  )}
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
  inputContainer1: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 9,
  },
  addButton: {
    backgroundColor: '#000953',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  doctorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  doctorLabel: {
    flex: 1,
    marginRight: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input1: {
    flex: 3,
    marginBottom: 2,
    marginRight:2,
    backgroundColor: 'white',
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    padding: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GUpdateCampReport;
