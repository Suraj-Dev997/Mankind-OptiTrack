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
import {TextInput, Button, Avatar,} from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../Configuration/Config';
import LinearGradient from 'react-native-linear-gradient';
import {format} from 'date-fns';

const GUpdateCampImages = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pdfPreviews, setPdfPreviews] = useState([]);
  const [feedback, setFeedback] = useState(''); // Feedback text
  const [crimgId, setCrimgId] = useState([]);
  const [imageUris, setImageUris] = useState([]);
  const [loading, setLoading] = useState(false);
  const {crid, id} = route.params;
  const [campDate, setCampDate] = useState(new Date());
  const [showCampDatePicker, setShowCampDatePicker] = useState(false);
  const formattedCampDate = format(campDate, 'dd-MM-yyyy');

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
  // console.log('ImagePage crid',crid)
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
  const parseDateFromString = dateString => {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
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
          const nextcamp = data[0].next_date || ''; // Assuming feedback is the same for all images
          console.log('next camp', nextcamp);
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
          const campDate = parseDateFromString(nextcamp);
          setImagePreviews(imagePreviews);
          setFeedback(feedbackText);
          setCampDate(campDate);
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
  const submitData = async () => {
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
      formData.append('nextDate', formattedCampDate);
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
          {text: 'OK', onPress: () => navigation.navigate('GReportList', {id})},
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
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.form}>
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
            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerLabel} onPress={showCampDate}>
                Next camp plan date:
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

export default GUpdateCampImages;
