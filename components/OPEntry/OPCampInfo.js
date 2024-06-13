import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {TextInput, Button, Avatar} from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../Configuration/Config';

const OPCampInfo = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pdfPreviews, setPdfPreviews] = useState([]);
  const [feedback, setFeedback] = useState(''); // Feedback text
  const [imageUris, setImageUris] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [selectedValue, setSelectedValue] = useState('option1');
  const [brandOptions, setBrandOptions] = useState([]);
  const [brand, setBrand] = useState();
  const [textInputValue, setTextInputValue] = useState('');
  const [userEmpCode, setUserEmpCode] = useState('');
  const [campDate, setCampDate] = useState();
  const [hq, setHq] = useState();
  const {crId, id} = route.params;
  const [doctor, setDoctor] = useState();
  const [institute, setInstitute] = useState();
  const [brandName, setBrandName] = useState();
  const [city, setCity] = useState(''); 
  const [state, setState] = useState(''); 
  const [zone, setZone] = useState(''); 
  const [address, setAddress] = useState();
  const [doctor4, setDoctor4] = useState();
  //   console.log('Camp info crid',crId)

  useEffect(() => {
    const handleMoreInfo = async doctor => {
      setIsLoading(true);
      try {
        const payload = {
          orId: crId,
        };
        const ApiUrl = `${BASE_URL}${'/operativeReport/getReportInfoWithId'}`;
        const response = await fetch(ApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          if (Array.isArray(data) && data.length > 0) {
            const doctorData = data[0];
            console.log('doc data', doctorData);
        
            setHq(doctorData.camp_location);
            setCampDate(doctorData.camp_date);
            setDoctor(doctorData.doctor_name);
            setInstitute(doctorData.hospital_name);
            setBrandName(doctorData.description);
            setAddress(doctorData.address);
            setState(doctorData.state_name);
            setCity(doctorData.city_name);
            setZone(doctorData.zone_name);
           
          }
        } else {
          console.error('Error fetching doctor data:', response.statusText);
        }
        setIsLoading(false);
      } catch (error) {
        console.log('Error saving data:', error);
        setIsLoading(false);
      }
    };
    handleMoreInfo();
  }, [crId]);

  useEffect(() => {
    // Function to fetch data from the API
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const ApiUrl = `${BASE_URL}/report/getImages`;
        const response = await fetch(ApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            crId: crId, // Replace with the correct crId
            subCatId: id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const ReportUrl = `${BASE_URL}${'/uploads/report/'}`;
          if (data.length > 0) {
            // Extract image paths and feedback from the response
            const imagePaths = data.map(item => ReportUrl + item.imgpath);
            const feedbackText = data[0].feedback || ''; // Assuming feedback is the same for all images
            console.log(imagePaths);
  
            // Set the imagePreviews and feedback states
            setImagePreviews(
              imagePaths.map((path, index) => (
                <TouchableOpacity key={index}>
                  <Image source={{uri: path}} style={styles.previewImage} />
                </TouchableOpacity>
              )),
            );
            setFeedback(feedbackText);
          } else {
            console.log('No images found in the response data');
            setFeedback(''); // Clear feedback if no images are found
          }
        } else {
          console.error('Failed to fetch data from the API');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    // Call the fetchData function when the component is mounted
    fetchData();
  }, [crId, id]);



  const getUserIdFromStorage = async () => {
    try {
      const data = await AsyncStorage.getItem('userdata');
      if (data) {
        const userData = JSON.parse(data);
        return userData.responseData.user_id;
      } else {
        console.log('Invalid or missing data in AsyncStorage');
        return null; // Return null if user_id is not available
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null; // Return null in case of an error
    }
  };

  return (
    <View style={styles.container}>
      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000953" />
        </View>
      )}
      <ScrollView>
        <View style={styles.form}>
          <Text style={styles.datePickerLabel}>Brand Name:</Text>
          <TextInput
            value={brandName}
            editable={false}
            mode="outlined"
            style={styles.input}
          />
           <Text style={styles.datePickerLabel}>Doctor Name:</Text>
          <TextInput
            value={doctor}
            editable={false}
            mode="outlined"
            style={styles.input}
          />
          <Text style={styles.datePickerLabel}>Select Date of Entry:</Text>
          <TextInput
            value={campDate}
            editable={false}
            mode="outlined"
            style={styles.input}
          />
          
          <Text style={styles.datePickerLabel}>Institute / Hospital Name:</Text>
          <TextInput
            value={institute}
            editable={false}
            mode="outlined"
            style={styles.input}
          />
           <Text style={styles.datePickerLabel}>Camp Address:</Text>
          <TextInput
            value={address}
            editable={false}
            mode="outlined"
            style={styles.input}
          />
          <Text style={styles.datePickerLabel}>State:</Text>
          <TextInput
            value={state}
            editable={false}
            mode="outlined"
            style={styles.input}
          />
          <Text style={styles.datePickerLabel}>City:</Text>
          <TextInput
            value={city}
            editable={false}
            mode="outlined"
            style={styles.input}
          />
          <Text style={styles.datePickerLabel}>Zone:</Text>
          <TextInput
            value={zone}
            editable={false}
            mode="outlined"
            style={styles.input}
          />
         
          
 

          {/* <Text style={styles.datePickerLabel}>Brands Name:</Text>
          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            {isLoading && <Text>Loading...</Text>}
            {!isLoading && !brand && <Text>No brands available</Text>}
            {!isLoading &&
              Array.isArray(brand) &&
              brand.length > 0 &&
              brand.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    margin: 5,
                    padding: 5,
                    paddingLeft: 15,
                    paddingRight: 15,
                    backgroundColor: 'white',
                    color: '#000953',
                    borderWidth: 1,
                    borderColor: '#000953',
                    borderRadius: 50,
                  }}>
                  <Text style={{color: '#000953'}}>{item}</Text>
                </TouchableOpacity>
              ))}
          </View> */}
          <Text style={styles.datePickerLabel}>Post-Op Entry Images:</Text>
          <View style={styles.previewContainer}>
            {imagePreviews.map((preview, index) => (
              <View key={index}>{preview}</View>
            ))}
            {pdfPreviews.map((preview, index) => (
              <View key={index}>{preview}</View>
            ))}
          </View>
          <Text style={styles.datePickerLabel}>Feedback</Text>
          <TextInput
            value={feedback}
            editable={false}
            mode="outlined"
            style={styles.input}
          />
        </View>
      </ScrollView>
    </View>
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
  deleteButton: {
    color: 'red',
    textAlign: 'center',
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
    marginTop: 10,
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
    marginBottom: 3, // Spacing between label and button
    color: '#000953',
    fontWeight: '600',
  },
  datePickerButton: {
    width: 'auto',
    borderRadius: 5,
    textAlign: 'left',
    alignItems: 'flex-start',
    fontSize: 16, // You can adjust the font size as needed
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#000953',
    padding: 5,
    marginBottom: 12,
  },
  container: {
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
  uploadButton: {
    backgroundColor: '#08a5d8',
    borderColor: '#000953',
    color: '#000953',
    // borderStyle: 'dotted',
    borderWidth: 2,
    marginTop: 16,
    padding: 30,
    borderRadius: 5,
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  previewImage: {
    width: 100,
    height: 100,
    margin: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  previewPdf: {
    width: 100,
    height: 100,
    margin: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    paddingTop: 40,
  },
});

export default OPCampInfo;
