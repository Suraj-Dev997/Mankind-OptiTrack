import React, {useRef, useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import ViewShot from 'react-native-view-shot';
import RNFetchBlob from 'rn-fetch-blob';

import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {Picker} from '@react-native-picker/picker';
import {Button, ToggleButton} from 'react-native-paper';
import {PDFDocument, Page} from 'react-native-pdf-lib';

import RNFS from 'react-native-fs';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {BASE_URL} from '../Configuration/Config';
import {useRoute} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import useNetworkStatus from '../useNetworkStatus';

// const DoctorPoster = ({doctorInfo, doctorImage}) => {
//   return (
//     <View style={styles.posterContainer}>
//       {/* Your poster template */}
//       <Image
//         source={require('./Images/Melasma.jpg')}
//         style={styles.posterImage}
//       />
//       <View style={styles.imageContainer}>
//         <Image
//           source={{uri: doctorImage}}
//           style={styles.doctorImage}
//           resizeMode="cover"
//         />
//       </View>
//       <Text style={styles.doctorName}>{doctorInfo.name}</Text>
//       {/* Other doctor info */}
//     </View>
//   );
// };

const PosterDownload = () => {
  const [posters, setPosters] = useState([]);
  const [avatarUri, setAvatarUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [campTypes, setCampTypes] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState('');
  const [selectedCampId, setSelectedCampId] = useState('1');
  const [langs, setLangs] = useState([]);
  const [selectedlang, setSelectedLang] = useState('');
  const [selectedLangId, setSelectedLangId] = useState('1');
  const [selectedLangKey, setSelectedLangKey] = useState('en');

  const route = useRoute();

  const {doctorId, dc_id, id} = route.params;
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage(prevLanguage => (prevLanguage === 'en' ? 'hi' : 'en'));
  };

  const isConnected = useNetworkStatus();

  useEffect(() => {
    if (!isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection.',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      );
    }
  }, [isConnected]);

  useEffect(() => {
    // Fetch data from API endpoint
    // fetchCampTypes();
    // fetchLangs();
    addPoster();
  }, []);
  // const fetchCampTypes = async () => {
  //   const ApiUrl = `${BASE_URL}${'/basic/getPosterType'}`;
  //   try {
  //     const response = await fetch(ApiUrl, {
  //       method: 'GET',
  //     });

  //     const result = await response.json();
  //     setCampTypes(result);
  //   } catch (error) {
  //     console.log('Error fetching camp types:', error.message);
  //   }
  // };

  const handleCampChange = (value, index) => {
    setSelectedCamp(value);
    setSelectedCampId(value);
    console.log('setSelectedCamp id', value);
    addPoster();
    // Additional logic if needed when the camp selection changes
  };

  // const fetchLangs = async () => {
  //   const ApiUrl = `${BASE_URL}${'/basic/getLanguage'}`;
  //   try {
  //     const response = await fetch(ApiUrl, {
  //       method: 'GET',
  //     });

  //     const result = await response.json();
  //     console.log('Lang res', result);
  //     if (result && result.length > 0) {
  //       console.log('Lang res', result);
  //       setLangs(result);
  //       // Set default selected language if needed
  //       // setSelectedLang(result[0]?.langkey || '');
  //     } else {
  //       console.error('Error fetching Langs:', result.message);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching Langs:', error.message);
  //   }
  // };

  const handleLangChange = (value, index) => {
    setSelectedLang(value);
    setSelectedLangId(value);
    setSelectedLangKey(value);
    console.log('setSelectedLangKey', value);
    addPoster();

    // Additional logic if needed when the camp selection changes
  };
  const handleMoreInfo = useCallback(async () => {
    try {
      const payload = {
        docId: doctorId,
        pType: id,
        lang: language,
        subCatId: id,
      };
      console.log('Payload getposter', payload);
      const ApiUrl = `${BASE_URL}${'/doc/getPoster'}`;
      const ProfileUrl = `${BASE_URL}${'/'}`;
      const response = await fetch(ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setPosters(data);
        console.log('API Response:', data);
        if (Array.isArray(data) && data.length > 0) {
          const doctorData = data[0];
          console.log('Poster Name', doctorData.poster_name);
          if (doctorData.poster_name) {
            // Assuming that the API provides a valid image URL
            setAvatarUri(`${ProfileUrl}${doctorData.poster_name}`);
            console.log(avatarUri);
          }
        }
      } else {
        console.log('Error fetching doctor data1:', response.statusText);
      }
    } catch (error) {
      console.log('Error saving data:', error);
    }
  }, [avatarUri, doctorId, id, language]);

  const addPoster = useCallback(async () => {
    const ApiUrl = `${BASE_URL}/addPoster`;

    const payload = {
      docId: doctorId,
      posterType: id,
      lang: language,
      subCatId: id,
    };
    console.log('Payload after', payload);

    try {
      const response = await fetch(ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any additional headers if required
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Add Poster res', result);

        if (result && result.errorCode === '1') {
          // Handle the success response here
          return result;
        } else {
          console.log('Error adding poster:', result.message);
          // Handle the case where the poster addition is not successful
          return null;
        }
      } else {
        console.log('Error adding poster:', response.statusText);
        // Handle the error response here
        return null;
      }
    } catch (error) {
      console.log('Error adding poster:', error.message);
      // Handle any other errors that might occur during the fetch
      return null;
    }
  }, [doctorId, id, language]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await addPoster();
        await handleMoreInfo();
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [addPoster, handleMoreInfo]);
  //   const addPoster = async () => {
  //     const ApiUrl = `${BASE_URL}/addPoster`;

  //     const payload = {
  //         docId:doctorId,
  //         campTypeId:selectedCampId,
  //         lang:selectedLangKey,
  //     };
  // console.log("Payload after",payload);
  //     try {
  //         const response = await fetch(ApiUrl, {
  //             method: 'POST',
  //             headers: {
  //                 'Content-Type': 'application/json',
  //                 // Add any additional headers if required
  //             },
  //             body: JSON.stringify(payload),
  //         });

  //         if (response.ok) {
  //             const result = await response.json();
  //             console.log("Add Poster res", result);

  //             if (result && result.errorCode === "1") {
  //                 // Handle the success response here
  //                 return result;
  //             } else {
  //                 console.error('Error adding poster:', result.message);
  //                 // Handle the case where the poster addition is not successful
  //                 return null;
  //             }
  //         } else {
  //             console.log('Error adding poster:', response.statusText);
  //             // Handle the error response here
  //             return null;
  //         }
  //     } catch (error) {
  //         console.log('Error adding poster:', error.message);
  //         // Handle any other errors that might occur during the fetch
  //         return null;
  //     }
  // };

  // useEffect(() => {
  //   const handleMoreInfo = async doctor => {
  //     try {
  //       const payload = {
  //         docId:doctorId,
  //         campTypeId:selectedCampId,
  //         lang:selectedLangKey,
  //       };
  //       const ApiUrl = `${BASE_URL}${'/doc/getPoster'}`;
  //       const ProfileUrl = `${BASE_URL}${'/'}`;
  //       const response = await fetch(ApiUrl, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify(payload),
  //       });
  //       if (response.ok) {
  //         const data = await response.json();
  //         console.log('API Response:', data);
  //         if (Array.isArray(data) && data.length > 0) {
  //           const doctorData = data[0];
  //           console.log("Poster Name",doctorData.poster_name);
  //           if (doctorData.poster_name) {
  //             // Assuming that the API provides a valid image URL
  //             setAvatarUri(`${ProfileUrl}${doctorData.poster_name}`);
  //             console.log(avatarUri);
  //           }
  //         }
  //       } else {
  //         console.error('Error fetching doctor data:', response.statusText);
  //       }
  //     } catch (error) {
  //       console.log('Error saving data:', error);
  //     }
  //   };
  //   handleMoreInfo();
  // }, [avatarUri, doctorId, selectedCampId, selectedLangKey]);

  const viewShotRef = useRef(null);

  useEffect(() => {
    request(PERMISSIONS.WRITE_EXTERNAL_STORAGE).then(result => {
      if (result === RESULTS.GRANTED) {
        console.log('Permission granted');
      }
    });
  }, []);
  const downloadPDF1 = async poster => {
    try {
      setLoading(true);
      const randomNum = Math.floor(Math.random() * 10000); // Generates a random number between 0 and 9999
      const pdfName = `OptiTrack_Document_${randomNum}.pdf`;

      const path = RNFetchBlob.fs.dirs.DownloadDir + '/' + pdfName;

      const response = await RNFetchBlob.config({
        fileCache: true,
        appendExt: 'pdf',
        path,
      }).fetch('GET', `${BASE_URL}/${poster.poster_name}`, {
        'Content-Type': 'application/pdf',
        Accept: 'application/pdf',
      });

      console.log('Response Info:', response.info());

      if (response.respInfo.status === 200) {
        const fileContent = await RNFetchBlob.fs.readFile(path, 'base64');
        console.log('File Content (Base64):', fileContent.substring(0, 50)); // Log the first 50 characters of the file content

        console.log('PDF downloaded successfully at:', path);
        Alert.alert(
          'Download Successful',
          'PDF downloaded successfully',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
      } else {
        throw new Error(`HTTP status ${response.respInfo.status}`);
      }
    } catch (error) {
      console.log('Error downloading PDF:', error);
      Alert.alert(
        'Download Error',
        'There was an error downloading the PDF',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } finally {
      setLoading(false); // Stop loading, whether successful or not
    }
  };

  const downloadAndConvertToPDF = async poster => {
    try {
      console.log('poster_name', poster);
      setLoading(true);
      const randomNum = Math.floor(Math.random() * 10000); // Generates a random number between 0 and 9999
      const imageName = `OptiTrack_Poster_${randomNum}.png`;

      const imagePath = RNFetchBlob.fs.dirs.DownloadDir + '/' + imageName;

      // Download the image
      const response = await RNFetchBlob.config({
        fileCache: true,
        appendExt: 'png',
        path: imagePath,
      }).fetch('GET', `${BASE_URL}/${poster.poster_name}`);

      const responseInfo = response.info();
      console.log('Response Info:', responseInfo);

      if (responseInfo.status !== 200) {
        throw new Error(`HTTP status ${responseInfo.status}`);
      }

      // Check if the downloaded file is an image
      if (responseInfo.headers['content-type'].startsWith('image/')) {
        console.log('Image downloaded successfully at:', imagePath);

        // Create HTML content with the downloaded image
        const htmlContent = `
          <html>
            <head>
              <style>
                body {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                }
                img {
                  max-width: 100%;
                  max-height: 100%;
                }
              </style>
            </head>
            <body>
              <img src="file://${imagePath}" />
            </body>
          </html>
        `;

        // Convert HTML to PDF
        const pdfName = `OptiTrack_Document_${randomNum}.pdf`;
        const pdfPath = RNFetchBlob.fs.dirs.DownloadDir + '/' + pdfName;

        let options = {
          html: htmlContent,
          fileName: `OptiTrack_Document_${randomNum}`,
          directory: 'Documents',
        };

        const pdf = await RNHTMLtoPDF.convert(options);

        const sourcePath = pdf.filePath;
        const destPath = `${RNFS.DownloadDirectoryPath}/${pdfName}`;

        await RNFS.moveFile(sourcePath, destPath);

        console.log('PDF moved to download folder:', destPath);

        Alert.alert(
          'Download Successful',
          'PDF downloaded successfully',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
      } else {
        throw new Error('The downloaded file is not an image.');
      }
    } catch (error) {
      console.log('Error downloading or converting to PDF:', error);
      Alert.alert(
        'Download Error',
        error.message ||
          'There was an error downloading or converting the file to PDF',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } finally {
      setLoading(false); // Stop loading, whether successful or not
    }
  };
  // const downloadBlankPoster = async (poster) => {
  //   try {
  //     console.log("poster_name",poster);
  //     setLoading1(true);
  //     const randomNum = Math.floor(Math.random() * 10000); // Generates a random number between 0 and 9999
  //     const imageName = `Poster_${randomNum}.png`;

  //     const imagePath = RNFetchBlob.fs.dirs.DownloadDir + '/' + imageName;

  //     // Download the image
  //     const response = await RNFetchBlob.config({
  //       fileCache: true,
  //       appendExt: 'png',
  //       path: imagePath,
  //     }).fetch('GET', `${BASE_URL}/uploads/poster/${poster.normal_poster_name}`);

  //     const responseInfo = response.info();
  //     console.log('Response Info:', responseInfo);

  //     if (responseInfo.status !== 200) {
  //       throw new Error(`HTTP status ${responseInfo.status}`);
  //     }

  //     // Check if the downloaded file is an image
  //     if (responseInfo.headers['content-type'].startsWith('image/')) {
  //       console.log('Image downloaded successfully at:', imagePath);

  //       // Create HTML content with the downloaded image
  //       const htmlContent = `
  //         <html>
  //           <head>
  //             <style>
  //               body {
  //                 display: flex;
  //                 justify-content: center;
  //                 align-items: center;
  //                 height: 100vh;
  //                 margin: 0;
  //               }
  //               img {
  //                 max-width: 100%;
  //                 max-height: 100%;
  //               }
  //             </style>
  //           </head>
  //           <body>
  //             <img src="file://${imagePath}" />
  //           </body>
  //         </html>
  //       `;

  //       // Convert HTML to PDF
  //       const pdfName = `Blank_Poster_Document_${randomNum}.pdf`;
  //       const pdfPath = RNFetchBlob.fs.dirs.DownloadDir + '/' + pdfName;

  //       let options = {
  //         html: htmlContent,
  //         fileName: `Blank_Poster_Document_${randomNum}`,
  //         directory: 'Documents',
  //       };

  //       const pdf = await RNHTMLtoPDF.convert(options);

  //       const sourcePath = pdf.filePath;
  //       const destPath = `${RNFS.DownloadDirectoryPath}/${pdfName}`;

  //       await RNFS.moveFile(sourcePath, destPath);

  //       console.log('PDF moved to download folder:', destPath);

  //       Alert.alert(
  //         'Download Successful',
  //         'Blank Poster and downloaded successfully',
  //         [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
  //         { cancelable: false }
  //       );
  //     } else {
  //       throw new Error('The downloaded file is not an image.');
  //     }
  //   } catch (error) {
  //     console.error('Error downloading or converting to PDF:', error);
  //     Alert.alert(
  //       'Download Error',
  //       error.message || 'There was an error downloading or converting the file to PDF',
  //       [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
  //       { cancelable: false }
  //     );
  //   } finally {
  //     setLoading1(false); // Stop loading, whether successful or not
  //   }
  // };

  const downloadImage = async poster => {
    try {
      setLoading1(true);
      const randomNum = Math.floor(Math.random() * 10000); // Generates a random number between 0 and 9999
      const imageName = `OptiTrack_Poster_${randomNum}.png`;

      const path = RNFetchBlob.fs.dirs.DownloadDir + '/' + imageName;

      const response = await RNFetchBlob.config({
        fileCache: true,
        appendExt: 'jpg',
        path,
      }).fetch('GET', `${BASE_URL}/${poster.poster_name}`);

      console.log('Image downloaded successfully at:', path);
      Alert.alert(
        'Download Successful',
        'Image downloaded successfully',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } catch (error) {
      console.log('Error downloading image:', error);
      Alert.alert(
        'Download Error',
        'There was an error downloading the image',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } finally {
      setLoading1(false); // Stop loading, whether successful or not
    }
  };

  // const downloadPdf = async (poster) => {
  //   try {
  //     setLoading(true);
  //     console.log('download pdf link', avatarUri);
  //     const randomNum = Math.floor(Math.random() * 10000); // Generates a random number between 0 and 9999
  //     const pdfName = `Document_${randomNum}.pdf`;
  //     const imageWidth = 830; // 8.5 inches (standard page width) * 72 DPI
  //     const imageHeight = 970; // 11 inches (standard page height) * 72 DPI

  //     const resizedImage = await Image.resolveAssetSource({uri: avatarUri});
  //     const aspectRatio = resizedImage.width / resizedImage.height;
  //     const newImageWidth =
  //       aspectRatio >= 1 ? imageWidth : imageHeight * aspectRatio;
  //     const newImageHeight =
  //       aspectRatio >= 1 ? imageWidth / aspectRatio : imageHeight;
  //     const containerStyle = `
  //     width: ${imageWidth}px;
  //     height: ${imageHeight}px;
  //     display: flex;
  //     justify-content: center;
  //     align-items: center;
  //   `;

  //     const imageStyle = `
  //     max-width: ${newImageWidth}px;
  //     max-height: ${newImageHeight}px;
  //     width: auto;
  //     height: auto;
  //   `;
  //     const htmlContent = `
  //     <html>
  //     <body>
  //       <div style="${containerStyle}">
  //         <img src="${avatarUri}" style="${imageStyle}" />
  //       </div>
  //     </body>
  //   </html>
  //     `;

  //     const options = {
  //       html: htmlContent,
  //       fileName: pdfName,
  //       directory: 'Documents',
  //     };

  //     const file = await RNHTMLtoPDF.convert(options);

  //     const sourcePath = file.filePath;
  //     const destPath = `${RNFS.DownloadDirectoryPath}/${pdfName}`;

  //     await RNFS.moveFile(sourcePath, destPath);

  //     console.log('PDF moved to download folder:', destPath);

  //     Alert.alert(
  //       'Download Successful',
  //       'PDF downloaded successfully',
  //       [{text: 'OK', onPress: () => console.log('OK Pressed')}],
  //       {cancelable: false},
  //     );
  //   } catch (error) {
  //     console.error('Error creating PDF:', error);

  //     Alert.alert(
  //       'Download Error',
  //       'There was an error creating the PDF',
  //       [{text: 'OK', onPress: () => console.log('OK Pressed')}],
  //       {cancelable: false},
  //     );
  //   } finally {
  //     setLoading(false); // Stop loading, whether successful or not
  //   }
  // };

  // const downloadPoster = async poster => {
  //   try {
  //     setLoading(true);
  //     const path = RNFetchBlob.fs.dirs.DownloadDir + '/' + poster.poster_name;
  //     const response = await RNFetchBlob.config({
  //       fileCache: true,
  //       appendExt: 'jpg',
  //       path,
  //     }).fetch('GET', `${BASE_URL}/${poster.poster_name}`);
  //     if (response.respInfo.status === 200) {
  //       Alert.alert(
  //         'Download Successful',
  //         'Poster downloaded successfully',
  //         [{text: 'OK', onPress: () => console.log('OK Pressed')}],
  //         {cancelable: false},
  //       );
  //     } else {
  //       console.error('Failed to download poster:', response.respInfo.status);
  //     }
  //   } catch (error) {
  //     console.error('Error downloading poster:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  return (
    // <LinearGradient colors={['#72c5f8',  '#9cbddd']} style={styles.container} >
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000953" />
        </View>
      )}
      {/* <Text style={styles.datePickerLabel}>Select Type of Camp:</Text>
      <View style={styles.pickcontainer}>
        <Picker
          selectedValue={selectedCamp}
          style={styles.picker}
          onValueChange={(value, index) => handleCampChange(value, index)}>
          {campTypes.map((camp, index) => (
            <Picker.Item key={camp.ptid} label={camp.ptype} value={camp.ptid} />
          ))}
        </Picker>
      </View> */}
      {/* <Text style={styles.datePickerLabel}>Select Language:</Text>
      <View style={styles.pickcontainer}>
        <Picker
          selectedValue={selectedlang}
          style={styles.picker}
          onValueChange={(value, index) => handleLangChange(value, index)}>
          {langs.map((lang, index) => (
            <Picker.Item
              key={lang.lang_id}
              label={lang.langvalue}
              value={lang.langkey}
            />
          ))}
        </Picker>
      </View> */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.buttont, language === 'en' && styles.selectedButton]}
          onPress={() => setLanguage('en')}>
          <Text
            style={[
              styles.buttonText,
              language === 'en' && styles.selectedButtonText,
            ]}>
            English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttont, language === 'hi' && styles.selectedButton]}
          onPress={() => setLanguage('hi')}>
          <Text
            style={[
              styles.buttonText,
              language === 'hi' && styles.selectedButtonText,
            ]}>
            हिन्दी
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {posters.map((poster, index) => (
          <View key={index} style={styles.container1}>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.postertitle}>
                Download Poster {index + 1}
              </Text>
            </TouchableOpacity>

            {poster.poster_name ? (
              <ViewShot
                ref={viewShotRef}
                options={{format: 'jpg', quality: 0.9}}
                style={styles.viewsstyle}>
                <Image
                  source={{uri: `${BASE_URL}/${poster.poster_name}`}}
                  style={{width: 250, height: 390}}
                />
              </ViewShot>
            ) : (
              <Text style={styles.noPosterText}>Poster not available</Text>
            )}

            <View style={styles.btncont}>
              <View style={styles.buttonContainer}>
                <LinearGradient
                  colors={['#000953', '#092d4f']}
                  style={styles.addbtn}>
                  <Button
                    style={styles.addbtn1}
                    labelStyle={styles.addbtnText}
                    onPress={() => downloadImage(poster)}>
                    {loading1 ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      'Download Image'
                    )}
                  </Button>
                </LinearGradient>
              </View>
              <View style={styles.buttonContainer}>
                <LinearGradient
                  colors={['#000953', '#092d4f']}
                  style={styles.addbtn}>
                  <Button
                    style={styles.addbtn1}
                    labelStyle={styles.addbtnText}
                    onPress={() => downloadAndConvertToPDF(poster)}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      'Download PDF'
                    )}
                  </Button>
                </LinearGradient>
              </View>
            </View>
            <View style={styles.btncont}></View>
          </View>
        ))}
      </ScrollView>
    </View>
    // </LinearGradient>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
  buttont: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#9cbddd',
    borderColor: '#000953',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: '#000953',
  },
  buttonText: {
    color: '#fff',
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
  viewsstyle: {
    borderWidth: 5,
    borderColor: '#000953',
    marginTop: 10,
  },
  addbtnText: {
    color: '#fff', // Set the text color here
  },
  addbtn: {
    backgroundColor: '#000953',
    paddingLeft: 1,
    paddingRight: 1,
    color: 'white',
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 50,
    width: '100%',
  },
  addbtn1: {
    color: '#fff',
  },
  postertitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000953',
  },
  btncont: {
    padding: 20,
    flexDirection: 'row', // Arrange items horizontally
    justifyContent: 'space-around', // Space evenly between items
  },
  buttonContainer: {
    flex: 1, // Equal flex for both buttons to take half of the available space
    marginHorizontal: 5, // Add margin between buttons (adjust as needed)
  },
  Button: {
    // margin:20
    borderRadius: 50,
  },
  container: {
    //  backgroundColor:'#B9D9EB',
    flex: 1,
    padding: 10,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  container1: {
    //  backgroundColor:'#B9D9EB',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterContainer: {
    position: 'relative',
    width: 500, // Set to your poster width
    height: 520, // Set to your poster height
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Clip overflowing content
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },

  doctorImage: {
    width: '100%',
    height: '100%',
  },
  doctorName: {
    position: 'absolute',
    bottom: '13%',
    left: '41%', // Adjust the position as needed
    textAlign: 'center',
    fontSize: 16,
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

  downloadButton: {
    backgroundColor: '#000953',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
export default PosterDownload;
