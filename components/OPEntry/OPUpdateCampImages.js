import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
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
import LinearGradient from 'react-native-linear-gradient';
import {format} from 'date-fns';

const OPUpdateCampImages = () => {
  const [isDataFetched, setIsDataFetched] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pdfPreviews, setPdfPreviews] = useState([]);
  const [feedback, setFeedback] = useState(''); // Feedback text
  const [crimgId, setCrimgId] = useState([]);
  const [imageUris, setImageUris] = useState([]);
  const [loading, setLoading] = useState(false);
  const {crid, id} = route.params;
  const [address, setAddress] = useState();
  const [city, setCity] = useState([]);
  const [state, setState] = useState([]);
  const [zone, setZone] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');

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
  const [brandReplaced, setBrandReplaced] = useState();
  const [institute, setInstitute] = useState();
  const [doctor3, setDoctor3] = useState();
  const [doctor4, setDoctor4] = useState();

  const [isLoading, setIsLoading] = useState(true);
  const [textInputValue, setTextInputValue] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dropdownItems] = useState(['Option 1', 'node', 'React']);
  const [selectedMr, setSelectedMr] = useState();
  const [selectedCenter, setSelectedCenter] = useState('');
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
  const formattedCampDate = format(campDate, 'dd-MM-yyyy');
  const [mrNames, setMrNames] = useState([]); // State to store MR names
  const [centerNames, setCenterNames] = useState([]); // State to store MR names
  // console.log('ImagePage crid',crid)
  useEffect(() => {
    fetchCampData();
  }, []);

  useEffect(() => {
    fetchReportInfo();
  }, [centerData, city, crid, mrData, selectedState, state, zone]);

  const fetchCampData = async () => {
    try {
      await Promise.all([fetchMrData(), fetchState(),fetchReportAndCity(),fetchZone()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchReportAndCity = async (value) => {
    setIsLoading(true);
    const apiUrl = `${BASE_URL}/operativeReport/getReportInfoWithId`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orId: crid,
        }),
      });

      const result = await response.json();

      if (result && result.length > 0) {
       
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
          orId: crid,
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
        setAddress(reportInfo.address);
        setSelectedState(parseInt(reportInfo.state_id))
        setDoctor(reportInfo.doctor_name);
        setBrandReplaced(reportInfo.brand_replaced);
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

        // Find and set the selected state
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
      setIsLoading(false);

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
      } else {
        console.log('Error fetching report info-:', result.message);
      }
    } catch (error) {
      console.log('Error fetching report info--:', error.message);
    } finally {
      // Set loading to false after fetching data
      setIsLoading(false);
    }
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
  const handleStateChange = (itemValue) => {
    setSelectedState(itemValue);
  
    // Find the MR info for the selected MR based on empcode
    const selectedStateInfo = state.find(mr => mr.id === itemValue) || {};
    fetchReportAndCity(itemValue);
  
    
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
           address:address,
            state:selectedState,
            city: selectedCity,
            zone:selectedZone,
            brandId: selectedMr,
            doctorName: doctor,
            brandReplaced:brandReplaced,
            campDate: formattedCampDate,
            hospitalName: institute,
            orId: crid,
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
          // navigation.navigate('OPUpdateCampImages', {crid: crId, id});
          console.log('navigation values', id);
          submitData1();
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



  const deleteImage = async crimgid => {
    try {
      const ApiUrl = `${BASE_URL}/report/deleteSingalImg`;
      const response = await fetch(ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crimgid,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Delete successful Response:', data);
        // Handle success, e.g., display a success message.
      } else {
        // Handle error scenarios
        console.log('Delete HTTP Error:', response.status);
        const errorText = await response.text();
        console.log('Delete Error Response:', errorText);
        // Implement error handling based on the response status code or content.
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  useEffect(() => {
    // Function to fetch data from the API
    const fetchData = async () => {
      try {
        const ApiUrl = `${BASE_URL}/report/getImages`;
        const response = await fetch(ApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            crId: crid, // Replace with the correct crId
            subCatId: id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // console.log(data);
          const ReportUrl = `${BASE_URL}${'/uploads/report/'}`;
          // Extract image paths and feedback from the response
          const imagePaths = data.map(item => ReportUrl + item.imgpath);
          const CriImID = data.map(item => item.crimgid);
          setCrimgId(CriImID);
          // console.log(CriImID);
          const feedbackText = data.length > 0 ? data[0].feedback || '' : ''; // Assuming feedback is the same for all images
          // console.log(imagePaths);

          // Set the imagePreviews and feedback states
          const imagePreviews = imagePaths.map((path, index) => (
            <ImagePreview
              key={index}
              uri={path}
              index={index}
              crimgid={CriImID[index]}
            />
          ));

          setImagePreviews(imagePreviews);
          setFeedback(feedbackText);
        } else {
          console.error('Failed to fetch data from the API');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // const handleDeleteImagePre = async (indexToDelete) => {
    //   const crimgidToDelete = crimgId[indexToDelete]; // Get the crimgid to delete
    //   setImagePreviews((prevPreviews) =>
    //     prevPreviews.filter((_, index) => index !== indexToDelete)
    //   );

    //   // Call the deleteImage function with the crimgid to delete
    //   await deleteImage(crimgidToDelete);
    // };

    // Call the fetchData function when the component is mounted
    fetchData();
  }, [crid, id]);
  function ImagePreview({uri, index, crimgid}) {
    const handleDeleteImage1 = async () => {
      // Call the deleteImage function with the crimgid to delete
      await deleteImage(crimgid);
      console.log(crimgid);
      // Update the image previews after deleting the image
      setImagePreviews(prevPreviews =>
        prevPreviews.filter((_, i) => i !== index),
      );
    };

    return (
      <TouchableOpacity onPress={handleDeleteImage1}>
        <Image source={{uri}} style={styles.previewImage} />
        <Text style={styles.deleteButton}>Delete</Text>
      </TouchableOpacity>
    );
  }
  // const handleDeleteImage1 = (indexToDelete) => {
  //   setImagePreviews((prevPreviews) =>
  //     prevPreviews.filter((_, index) => index !== indexToDelete)
  //   );
  // };
  const handleImageUpload = async () => {
    try {
      if (imageUris.length >= 10) {
        // If there are already 3 images, show an alert
        alert('You can upload a maximum of 10 images');
        return;
      }
      const images = await ImagePicker.openPicker({
        mediaType: 'photo',
        multiple: true, // Allow multiple image selection
      });
      if (images.length + imageUris.length > 10) {
        // If the total number of selected images exceeds 3, show an alert
        alert('You can upload a maximum of 10 images');
        return;
      }

      const previews = images.map((image, index) => (
        <TouchableOpacity key={index} onPress={() => handleDeleteImage(index)}>
          <Image source={{uri: image.path}} style={styles.previewImage} />
          <Text style={styles.deleteButton}>Delete</Text>
        </TouchableOpacity>
      ));

      // Store image URIs directly in an array
      const newImageUris = images.map(image => image.path);

      setImagePreviews(prevPreviews => [...prevPreviews, ...previews]);

      // Store the image URIs in another state variable
      setImageUris(prevImageUris => [...prevImageUris, ...newImageUris]);
    } catch (error) {
      // Handle the error, e.g., if the user cancels the selection
      console.error('Image picker error:', error);
    }
  };

  const handleDeleteImage = indexToDelete => {
    setImagePreviews(prevPreviews =>
      prevPreviews.filter((_, index) => index !== indexToDelete),
    );
  };
  const handlePdfUpload = () => {
    // You can implement PDF file upload logic here.
    // For demonstration purposes, I'm just displaying a text placeholder.
    const pdfPreview = (
      <Text key={Math.random()} style={styles.previewPdf}>
        PDF File Preview
      </Text>
    );
    setPdfPreviews([...pdfPreviews, pdfPreview]);
  };
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
  const submitData1 = async () => {
    try {
      setLoading(true);
      const userId = await getUserIdFromStorage();

      if (userId === null) {
        // Handle the case where userId is not available
        return;
      }
      const ApiUrl = `${BASE_URL}${'/report/updateImages'}`;

      // Create a FormData object
      const formData = new FormData();

      // Append data to the FormData object
      formData.append('crId', crid); // Replace with the correct crId
      formData.append('userId', userId); // Replace with the correct userId
      formData.append('feedback', feedback);
      formData.append('subCatId', id);
      // Append images to the FormData object
      imageUris.forEach((imageUri, index) => {
        const imageName = `image_${index + 1}.jpg`;
        formData.append('images', {
          uri: imageUri,
          name: imageName,
          type: 'image/jpeg',
        });
      });

      console.log(formData);
      // Send a POST request with the FormData
      const response = await fetch(ApiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Handle the response from the API

      if (response.ok) {
        const data = await response.json();
        console.log('Upload successful Response:', data);
        Alert.alert('Success', 'Camp Report Updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('OPReportList', {id}),
          },
        ]);
        console.log('Forwarded Crid', id);
      } else {
        // Handle success response from the API
        const error = await response.json();
        console.log('Error', error);
        // Navigate to the next screen
      }
    } catch (error) {
      // Handle any errors that occur during the upload process
      console.error('Error uploading data:', error);
    } finally {
      setLoading(false); // Stop loading, whether successful or not
    }
  };

  return (
    <LinearGradient colors={['#9cbddd', '#9cbddd']} style={styles.container}>
    {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000953" />
        </View>
      )}
      <View style={styles.container}>
      
        <ScrollView>
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
            <Text style={styles.datePickerLabel}>Brand Replaced</Text>
            <TextInput
              // label="HQ"
              value={brandReplaced}
              onChangeText={text => setBrandReplaced(text)}
              mode="outlined"
              style={styles.input}
              outlineColor="#000953"
              activeOutlineColor="#08a5d8"
              placeholder='Type here'
            />
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

            <Text style={styles.datePickerLabel}>
              Upload a maximum of 10 images.
            </Text>
            <TouchableOpacity onPress={handleImageUpload}>
              <Button
                // buttonColor="#000953"
                mode="contained"
                style={styles.uploadButton}>
                Upload Image (jpg/png)
              </Button>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={handlePdfUpload}>
            <Button
              buttonColor="#000953"
              mode="contained"
              style={styles.uploadButton}
            >
              Upload PDF
            </Button>
          </TouchableOpacity> */}
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
              // label="Feedback"
              value={feedback}
              onChangeText={text => setFeedback(text)}
              mode="outlined"
              outlineColor="#000953"
              activeOutlineColor="#08a5d8"
              style={styles.input}
              placeholder='Type here'
            />
            {/* <Text style={styles.desc}>
            (Description: 1st choice of Brand for Dry-Eye management; Include comments from doctor, Patient feedback, any other necessary information)
            </Text> */}
            <TouchableOpacity>
              <LinearGradient
                colors={['#000953', '#092d4f']}
                style={styles.addbtn}>
                <Button onPress={submitData} labelStyle={styles.addbtnText}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    'Submit'
                  )}
                </Button>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
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
  desc:{
    color:'red',
    fontSize:10
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#000953',
    padding: 5,
    marginBottom: 12,
  },
  container: {
    //  backgroundColor:'#B9D9EB',
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
    backgroundColor: '#092d4f',
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
    marginTop: 16,
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

export default OPUpdateCampImages;
