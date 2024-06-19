import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
  processColor,
} from 'react-native';
import {Button, Searchbar, IconButton} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useRoute} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import {BASE_URL} from '../Configuration/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'rn-fetch-blob';
import {LineChart} from 'react-native-charts-wrapper';
import RNFS from 'react-native-fs';
import useNetworkStatus from '../useNetworkStatus';

// Create separate components for each category's content
const CategoryDash = ({users, filteredUsers, renderUserItem}) => (
  <View style={styles.container}>
    <Header />
    <View style={styles.tableCont}>
      <TableHeader />
    </View>
  </View>
);

const Header = () => {
  const route = useRoute();
  const {id, name} = route.params;
  const [chartData, setChartData] = useState(null);
  const [chartData1, setChartData1] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

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

  const fetchData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userdata');
      if (!storedData) {
        throw new Error('Invalid or missing data in AsyncStorage');
      }

      const userData = JSON.parse(storedData);
      const userId = userData.responseData.user_id;

      const ApiUrl = `${BASE_URL}${'/dashboard/getCampCount'}`;
      const response = await fetch(ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          subCatId: id,
        }),
      });

      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.log('Error fetching data:', error);
    }
  };

  return (
    <View style={styles.headerMain}>
      <Text style={{textAlign: 'center', fontSize: 18, marginVertical: 10}}>
        Camps Data
      </Text>
      {chartData ? (
        <LineChart
          style={{flex: 1}}
          data={{
            dataSets: [
              {
                values: chartData.yValues.map(item => ({
                  y: item.y,
                })),
                label: 'Camp Report Count',
                config: {
                  color: processColor('#00308F'),
                  drawValues: true,
                  valueTextSize: 12,
                  valueTextColor: processColor('black'),
                  circleColor: processColor('#00308F'),
                },
              },
            ],
          }}
          xAxis={{
            valueFormatter: chartData.xValues,
            position: 'BOTTOM',
            granularityEnabled: true,
            granularity: 1,
          }}
          yAxis={{
            left: {
              enabled: true,
            },
            right: {
              enabled: false,
            },
          }}
          legend={{
            enabled: true,
            textSize: 12,
            form: 'CIRCLE',
            formSize: 10,
            xEntrySpace: 10,
            yEntrySpace: 5,
          }}
        />
      ) : (
        <ActivityIndicator size="large" color="#0aae4d" />
      )}
    </View>
  );
};

const UserList = ({filteredUsers, renderUserItem}) => (
  <View style={styles.tableCont}>
    <TableHeader />
    <FlatList
      data={filteredUsers}
      renderItem={renderUserItem}
      keyExtractor={item => item.id.toString()}
    />
  </View>
);

const TableHeader = () => (
  <View style={styles.tableHeader}>
    <Text style={styles.columnHeader}>Name</Text>
    <Text style={styles.columnHeader1}>Date</Text>
    <Text style={styles.columnHeader1}>Actions</Text>
  </View>
);

const GDashboardList = () => {
  const route = useRoute();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedValue, setSelectedValue] = useState('');
  const [fromDate, setFromDate] = useState(new Date('2023-07-01'));
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const onChangeSearch = query => setSearchQuery(query);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const {id} = route.params;
  const handleFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
    } else {
      setFromDate(null); // Set fromDate to null if selectedDate is null
    }
  };

  const handleToDateChange = (event, selectedDate) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
    } else {
      setToDate(null); // Set toDate to null if selectedDate is null
    }
  };

  const showFromDate = () => {
    setShowFromDatePicker(true);
  };

  const showToDate = () => {
    setShowToDatePicker(true);
  };

  useEffect(() => {
    // Retrieve userId from AsyncStorage
    AsyncStorage.getItem('userdata')
      .then(data => {
        if (data) {
          const userData = JSON.parse(data);
          const userId = userData.responseData.user_id;

          // Fetch data from the API using the retrieved userId
          const ApiUrl = `${BASE_URL}${'/dashboard/getFilterCampReport'}`;
          fetch(ApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId, // Use the retrieved userId
              subCatId: id, // Replace with your subcategory ID
              filterBy: selectedValue,
              startDate: fromDate,
              endDate: toDate,
            }),
          })
            .then(response => response.json())
            .then(responseData => {
              setData(responseData);
              console.log(responseData);
              console.log(selectedValue);
              setIsLoading(false);
            })
            .catch(error => {
              console.error('Error fetching data: ', error);
              setIsLoading(false);
            });
        } else {
          console.log('Invalid or missing data in AsyncStorage');
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.error('Error retrieving data: ', error);
        setIsLoading(false);
      });
  }, [id, selectedValue, fromDate, toDate]);

  // Render loading indicator if data is still loading
  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#000953" />
      </View>
    );
  }
  const generateRandomNumber = () => {
    // Generate a random number between 1 and 9999 (you can adjust the range)
    return Math.floor(Math.random() * 9999) + 1;
  };

  const downloadCsv = async () => {
    setIsLoading(true);

    try {
      const storedData = await AsyncStorage.getItem('userdata');
      if (!storedData) {
        throw new Error('Invalid or missing data in AsyncStorage');
      }

      const userData = JSON.parse(storedData);
      const userId = userData.responseData.user_id;
      console.log('Getting user id:', userId); // Replace with your user ID
      const subCatId = id; // Replace with your subcategory ID
      const randomFileName = `OptiTrack_Report_${generateRandomNumber()}.xlsx`;
      // const apiUrl = `${BASE_URL}/dashboard/getFilterCampReportCsv/?userId=${userId}&subCatId=${subCatId}`;

      // const response = await RNFetchBlob.config({
      //   fileCache: true,
      //   path: `${RNFetchBlob.fs.dirs.DownloadDir}/${randomFileName}`,
      // }).fetch('GET', apiUrl);
      const apiUrl = `${BASE_URL}/dashboard/getFilterCampReportCsv`;

      const payload = {
        userId: userId,
        subCatId: id,
        startDate: fromDate,
        endDate: toDate,
        filterBy: selectedValue,
      };
      console.log('Payload is', payload);
      const response = await RNFetchBlob.config({
        fileCache: true,
        path: `${RNFetchBlob.fs.dirs.DownloadDir}/${randomFileName}`, // Save in the download folder
      }).fetch(
        'POST',
        apiUrl,
        {
          'Content-Type': 'application/json', // Set the content type as JSON
        },
        JSON.stringify(payload),
      );
      console.log('Response is', response);
      if (response.respInfo.status === 200) {
        // Show success alert
        console.log('Report file downloaded successfully');
        Alert.alert(
          'Success',
          `Report file downloaded as ${randomFileName} successfully`,
          [{text: 'OK', onPress: () => {}}],
        );
      } else {
        // Show error alert
        console.log('Failed to download ');
        Alert.alert('Error', 'Failed to download ', [
          {text: 'OK', onPress: () => {}},
        ]);
        console.error('Failed to download ');
      }
    } catch (error) {
      // Show error alert
      console.log('Error downloading ');
      Alert.alert('Error', `Error downloading: ${error.message}`, [
        {text: 'OK', onPress: () => {}},
      ]);
      console.error('Error downloading:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const downloadUserCsv = async grid => {
    setIsLoading(true);

    try {
      const storedData = await AsyncStorage.getItem('userdata');
      if (!storedData) {
        throw new Error('Invalid or missing data in AsyncStorage');
      }

      const userData = JSON.parse(storedData);
      const userId = userData.responseData.user_id;
      console.log('Getting user id:', userId); // Replace with your user ID
      const subCatId = id; // Replace with your subcategory ID
      const randomFileName = `OptiTrack_UserReport_${generateRandomNumber()}.xlsx`;
      const apiUrl = `${BASE_URL}/dashboard/getFilterCampReportCsvWithId`;

      const payload = {
        crId: grid,
        subCatId: subCatId,
      };

      const response = await RNFetchBlob.config({
        fileCache: true,
        path: `${RNFetchBlob.fs.dirs.DownloadDir}/${randomFileName}`,
      }).fetch(
        'POST',
        apiUrl,
        {
          'Content-Type': 'application/json',
        },
        JSON.stringify(payload),
      );

      if (response.respInfo.status === 200) {
        // Show success alert
        console.log('User Report file downloaded successfully');
        Alert.alert(
          'Success',
          `User Report file downloaded as ${randomFileName} successfully`,
          [{text: 'OK', onPress: () => {}}],
        );
      } else {
        // Show error alert
        console.log('Failed to download ');
        Alert.alert('Error', 'Failed to download ', [
          {text: 'OK', onPress: () => {}},
        ]);
        console.error('Failed to download ');
      }
    } catch (error) {
      // Show error alert
      console.log('Error downloading ');
      Alert.alert('Error', `Error downloading: ${error.message}`, [
        {text: 'OK', onPress: () => {}},
      ]);
      console.error('Error downloading:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const renderUserItem = ({item}) => {
    const campDate = new Date(item.camp_date);

    // Define date options for formatting
    const dateOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    // Format the date using toLocaleDateString
    const formattedDate = campDate.toLocaleDateString('en-US', dateOptions);

    return (
      <View style={styles.userItem}>
        <View style={styles.userInfo}>
          <Text style>{item.doc_name1}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text> {formattedDate}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <IconButton
              icon="arrow-down-bold-box"
              iconColor="#000953"
              size={30}
              onPress={() => downloadUserCsv(item.grid)}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.headbott}>
        <View style={styles.headertop}>
          {/* <Button
            icon="download"
            mode="contained"
            style={styles.addbtn}
            onPress={() => console.log('Pressed')}
          >
            Download
          </Button> */}
          <LinearGradient colors={['#000953', '#092d4f']} style={styles.addbtn}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#000953" />
            ) : (
              <Button
                icon="download"
                labelStyle={styles.addbtnText}
                title="Download Excel"
                onPress={downloadCsv}>
                Download
              </Button>
            )}
          </LinearGradient>
        </View>
        <View style={styles.header}>
          <View style={styles.pickcontainer}>
            <Picker
              selectedValue={selectedValue}
              style={styles.picker}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedValue(itemValue)
              }>
              <Picker.Item label="Select Filter" value="" />
              <Picker.Item label="Week wise" value="week" />
              <Picker.Item label="Month wise" value="month" />
              <Picker.Item label="Date Wise" value="date" />
            </Picker>
          </View>
        </View>
        <View style={styles.header}>
          {selectedValue === 'date' && (
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <LinearGradient
                colors={['#000953', '#00aacf']}
                style={styles.datePickerContainer}>
                <Button
                  icon="calendar"
                  mode="outlined"
                  style={styles.addbtn1}
                  onPress={showFromDate}
                  // contentStyle={{ flexWrap: 'wrap' }}
                  labelStyle={{color: '#000953'}}>
                  From: {fromDate.toLocaleDateString()}
                </Button>
                {showFromDatePicker && (
                  <DateTimePicker
                    value={fromDate}
                    mode="date"
                    onChange={handleFromDateChange}
                  />
                )}
              </LinearGradient>

              <View style={styles.datePickerContainer}>
                <Button
                  icon="calendar"
                  mode="outlined"
                  style={styles.addbtn1}
                  onPress={showToDate}
                  labelStyle={{color: '#000953'}}
                  // contentStyle={{ flexWrap: 'wrap' }}
                >
                  To: {toDate.toLocaleDateString()}
                </Button>
                {showToDatePicker && (
                  <DateTimePicker
                    value={toDate}
                    mode="date"
                    onChange={handleToDateChange}
                  />
                )}
              </View>
            </View>
          )}
        </View>
      </View>
      <View style={styles.fullcont}>
        <TableHeader />
        <View style={styles.tableCont}>
          <FlatList
            data={data}
            keyExtractor={item => item.grid.toString()}
            renderItem={renderUserItem}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullcont: {
    backgroundColor: '#fff',
    flex: 1,
  },
  container1: {
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  headbott: {
    padding: 10,
  },
  button1: {
    flex: 1,
    margin: 2,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#000953',
    height: 80,
    textAlign: 'center',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText1: {
    textAlign: 'center',
    color: '#000953',
    fontSize: 15,
  },
  elevation: {
    elevation: 5,
    shadowColor: '#000',
  },
  containerDate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#000953',
    // paddingHorizontal:1,
  },
  datePickerLabel: {
    fontSize: 16, // You can adjust the font size as needed
    marginBottom: 3, // Spacing between label and button
    color: '#000953',
    fontWeight: '600',
  },
  datePickerButton: {
    fontSize: 16, // You can adjust the font size as needed
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d4d4d2',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  container: {
    backgroundColor: '#9cbddd',
    flex: 1,

    // backgroundColor:'#e6e6e7',
  },
  headerMain: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  headertop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickcontainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#6c9be6',

    flex: 1,
    borderRadius: 30,
    marginBottom: 10,
  },
  picker: {
    // backgroundColor:'#fff',
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 30,
    padding: 0,
  },
  addbtn: {
    backgroundColor: '#000953',
    paddingLeft: 1,
    paddingRight: 1,
    color: '#000',
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 50,
    width: '42%',
  },

  addbtnText: {
    color: '#fff', // Set the text color here
  },
  addbtn1: {
    fontFamily: 'System-Bold',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    borderRadius: 10,
    backgroundColor: '#fff', // Set the background color to transparent
    borderColor: 'transparent',
    // backgroundColor: '#000953',
    // paddingLeft:1,
    // paddingRight:1,
    color: '#000',
    // padding:2,
    //  marginTop:8,
    //  marginBottom:10,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    paddingHorizontal: 5,
  },
  tableCont: {
    margin: 5,
    padding: 16,
    marginTop: 5,
    flex: 1,
    backgroundColor: '#ffffff',
  },
  tableHeader: {
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: '#000953',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    color: '#fff',
    textAlign: 'center',
  },
  columnHeader: {
    textAlign: 'left',
    paddingLeft: 20,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
  },
  columnHeader1: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'center', // Center content horizontally
    alignItems: 'center', // Center content vertically
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center', // Center text horizontally
    alignItems: 'start', // Center text vertically
  },
  userInfoText: {
    textAlign: 'center', // Center text horizontally within userInfo
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center', // Center content vertically
  },

  actionButton: {
    paddingHorizontal: 0,
    paddingVertical: 2,
    marginLeft: 0,
  },
  actionButton1: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginLeft: 0,
  },
  actionButtonText: {
    color: 'white',
  },
});

export default GDashboardList;
