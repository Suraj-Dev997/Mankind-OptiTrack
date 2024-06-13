import React, {useState} from 'react';
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

const DEUploadCampImages = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pdfPreviews, setPdfPreviews] = useState([]);
  const [feedback, setFeedback] = useState(''); // Feedback text
  const [imageUris, setImageUris] = useState([]);
  const [loading, setLoading] = useState(false);
  const {crid, id} = route.params;

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

  const submitData = async () => {
  
    if (!imageUris || imageUris.length === 0) {
      // Display an alert message if any required fields are empty
      alert('Please select Image');
      return;
    }
  
    console.log("img uri",imageUris);
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
        formData.append('crId', crid); // Replace with the correct crId
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
              onPress: () => navigation.navigate('DEReportList', {id}),
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
            <Text style={styles.desc}>
            (Description: 1st choice of Brand for Dry-Eye management; Include comments from doctor, Patient feedback, any other necessary information)
            </Text>
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

export default DEUploadCampImages;
