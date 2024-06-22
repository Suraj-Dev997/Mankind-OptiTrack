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
import {BASE_URL} from '../Configuration/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {format} from 'date-fns';
import ImageResizer from '@bam.tech/react-native-image-resizer';

const OPUploadCampImages = () => {
  const navigation = useNavigation();
  const [doctorNames, setDoctorNames] = useState([]);
  const [filteredDoctorNames, setFilteredDoctorNames] = useState([]);
  const [repname, setRepname] = useState('');
  const [campDate, setCampDate] = useState(new Date());
  const [showCampDatePicker, setShowCampDatePicker] = useState(false);
  const [loction, setLocation] = useState();
  const [doctor, setDoctor] = useState();
  const [brandReplaced, setBrandReplaced] = useState();
  const [institute, setInstitute] = useState();
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
  const [textInputValue, setTextInputValue] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dropdownItems] = useState(['Option 1', 'node', 'React']);
  const [campTypes, setCampTypes] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState('');
  const [pathLabList, setPathLabList] = useState([]);
  const [selectedPathLab, setSelectedPathLab] = useState('');
  const [repList, setRepList] = useState([]);
  const [selectedRep, setSelectedRep] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const formattedCampDate = format(campDate, 'dd-MM-yyyy');
  const [selectedCampId, setSelectedCampId] = useState('');
  const [selectedPathlabId, setSelectedPathlabId] = useState('');
  const [selectedRepId, setSelectedRepId] = useState();
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [ncrid, setNcrid] = useState('');
  const route = useRoute();
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pdfPreviews, setPdfPreviews] = useState([]);
  const [feedback, setFeedback] = useState(''); // Feedback text
  const [imageUris, setImageUris] = useState([]);
  const [loading, setLoading] = useState(false);
  const {crid, id} = route.params;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch state first
        await fetchState();
        await fetchCity();
        await fetchZone();
        await fetchRepList();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Call fetchData function
    fetchData();
  }, []);

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
    console.log('image ur', imageUris);
    if (!imageUris || imageUris.length === 0) {
      // Display an alert message if any required fields are empty
      alert('Please select Image');
      return;
    }
    if (!doctor || !institute || !address) {
      // Display an alert message if any required fields are empty
      alert('Please fill in all required fields');
      return;
    }
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
            address: address,
            state: selectedStateId,
            city: selectedCityId,
            zone: selectedZoneId,
            brandId: selectedRepId,
            doctorName: doctor,
            hospitalName: institute,
            brandReplaced: brandReplaced,
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
          // navigation.navigate('OPUploadCampImages', {crid: data.ocrid, id});
          setNcrid(data.ocrid);
          console.log('navigation crid', data.ocrid);
          console.log('navigation values', id);
          submitData1(data.ocrid);
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

  // const handleImageUpload = async () => {
  //   try {
  //     if (imageUris.length >= 10) {
  //       // If there are already 3 images, show an alert
  //       alert('You can upload a maximum of 10 images');
  //       return;
  //     }
  //     const images = await ImagePicker.openPicker({
  //       mediaType: 'photo',
  //       multiple: true, // Allow multiple image selection
  //     });
  //     if (images.length + imageUris.length > 10) {
  //       // If the total number of selected images exceeds 3, show an alert
  //       alert('You can upload a maximum of 10 images');
  //       return;
  //     }
  //     const previews = images.map((image, index) => (
  //       <TouchableOpacity key={index} onPress={() => handleDeleteImage(index)}>
  //         <Image source={{uri: image.path}} style={styles.previewImage} />
  //         <Text style={styles.deleteButton}>Delete</Text>
  //       </TouchableOpacity>
  //     ));

  //     // Store image URIs directly in an array
  //     const newImageUris = images.map(image => image.path);

  //     setImagePreviews(prevPreviews => [...prevPreviews, ...previews]);

  //     // Store the image URIs in another state variable
  //     setImageUris(prevImageUris => [...prevImageUris, ...newImageUris]);
  //   } catch (error) {
  //     // Handle the error, e.g., if the user cancels the selection
  //     console.error('Image picker error:', error);
  //   }
  // };

  // const handleImageUpload1 = async () => {
  //   try {
  //     if (imageUris.length >= 10) {
  //       alert('You can upload a maximum of 10 images');
  //       return;
  //     }

  //     const images = await ImagePicker.openPicker({
  //       mediaType: 'photo',
  //       multiple: true,
  //     });

  //     if (images.length + imageUris.length > 10) {
  //       alert('You can upload a maximum of 10 images');
  //       return;
  //     }

  //     const compressedImages = await Promise.all(
  //       images.map(async image => {
  //         try {
  //           const compressedImage = await ImageResizer.createResizedImage(
  //             image.path,
  //             image.width,
  //             image.height,
  //             'JPEG', // You can also use 'PNG' or 'WEBP'
  //             80, // Compression quality, 0-100
  //           );
  //           return compressedImage.uri;
  //         } catch (error) {
  //           console.error('Image compression error:', error);
  //           return image.path; // Fallback to original image if compression fails
  //         }
  //       }),
  //     );

  //     const previews = compressedImages.map((uri, index) => (
  //       <TouchableOpacity key={index} onPress={() => handleDeleteImage(index)}>
  //         <Image source={{uri}} style={styles.previewImage} />
  //         <Text style={styles.deleteButton}>Delete</Text>
  //       </TouchableOpacity>
  //     ));

  //     setImagePreviews(prevPreviews => [...prevPreviews, ...previews]);
  //     setImageUris(prevImageUris => [...prevImageUris, ...compressedImages]);
  //   } catch (error) {
  //     console.error('Image picker error:', error);
  //   }
  // };

  const handleImageUpload = async () => {
    try {
      if (imageUris.length >= 10) {
        alert('You can upload a maximum of 10 images');
        return;
      }

      const images = await ImagePicker.openPicker({
        mediaType: 'photo',
        multiple: true,
      });

      if (images.length + imageUris.length > 10) {
        alert('You can upload a maximum of 10 images');
        return;
      }

      const compressedImages = await Promise.all(
        images.map(async image => {
          try {
            const imageFile = await fetch(image.path);
            const imageBlob = await imageFile.blob();
            const imageSize = imageBlob.size / (1024 * 1024); // Size in MB

            if (imageSize <= 1) {
              return image.path; // Skip compression if size is <= 1 MB
            }

            const compressedImage = await ImageResizer.createResizedImage(
              image.path,
              image.width,
              image.height,
              'JPEG', // You can also use 'PNG' or 'WEBP'
              80, // Compression quality, 0-100
            );

            return compressedImage.uri;
          } catch (error) {
            console.error('Image compression error:', error);
            return image.path; // Fallback to original image if compression fails
          }
        }),
      );

      const previews = compressedImages.map((uri, index) => (
        <TouchableOpacity key={index} onPress={() => handleDeleteImage(index)}>
          <Image source={{uri}} style={styles.previewImage} />
          <Text style={styles.deleteButton}>Delete</Text>
        </TouchableOpacity>
      ));

      setImagePreviews(prevPreviews => [...prevPreviews, ...previews]);
      setImageUris(prevImageUris => [...prevImageUris, ...compressedImages]);
    } catch (error) {
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

  const submitData1 = async crId => {
    try {
      setLoading(true);
      const ApiUrl = `${BASE_URL}${'/report/uploadImages'}`;

      // Retrieve userId from AsyncStorage
      const data = await AsyncStorage.getItem('userdata');
      if (data) {
        const userData = JSON.parse(data);
        const userId = userData.responseData.user_id;

        // Create a FormData object
        const formData = new FormData();

        // Append data to the FormData object
        formData.append('crId', crId); // Replace with the correct crId
        formData.append('userId', userId); // Use the retrieved userId
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
          Alert.alert('Success', 'Camp Report uploaded successfully', [
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
      } else {
        console.log('Invalid or missing data in AsyncStorage');
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
      <View style={styles.container}>
        <ScrollView>
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
            <Text style={styles.datePickerLabel}>Brand Replaced</Text>
            <TextInput
              // label="HQ"
              value={doctor}
              onChangeText={text => setDoctor(text)}
              mode="outlined"
              style={styles.input}
              outlineColor="#000953"
              activeOutlineColor="#08a5d8"
              placeholder="Type here"
            />
            <Text style={styles.datePickerLabel}>Doctor Name</Text>
            <TextInput
              // label="HQ"
              value={brandReplaced}
              onChangeText={text => setBrandReplaced(text)}
              mode="outlined"
              style={styles.input}
              outlineColor="#000953"
              activeOutlineColor="#08a5d8"
              placeholder="Type here"
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
              placeholder="Type here"
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
              placeholder="Type here"
            />
            <Text style={styles.datePickerLabel}>State:</Text>
            <View style={styles.pickcontainer}>
              <Picker
                selectedValue={selectedState}
                style={styles.picker}
                onValueChange={(value, index) =>
                  handleStateChange(value, index)
                }>
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
                onValueChange={(value, index) =>
                  handleCityChange(value, index)
                }>
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
                onValueChange={(value, index) =>
                  handleZoneChange(value, index)
                }>
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
              placeholder="Type here"
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
  desc: {
    color: 'red',
    fontSize: 10,
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

export default OPUploadCampImages;
