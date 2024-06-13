import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Button, Searchbar, IconButton} from 'react-native-paper';
import {useRoute} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {BASE_URL} from '../Configuration/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEReportList = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState([]); // Store fetched data
  const [isLoading, setIsLoading] = useState(true);

  const handleSearchTextChange = query => {
    setSearchText(query);
  };

  const {id} = route.params;
  const handleInfo = erid => {
    console.log('crid id', erid);
    navigation.navigate('DECampInfo', {crId: erid, id}); // Pass the doctorId as a parameter
  };

  const handleEdit = erid => {
    console.log('crid id', erid);
    navigation.navigate('DEUpdateCampReport', {crId: erid, id}); // Pass the doctorId as a parameter
  };

  const handleDelete = async erid => {
    console.log('This g', erid);
    try {
      const ApiUrl = `${BASE_URL}${'/eyeReport/deleteReportWithId'}`;
      const response = await fetch(ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crId: erid,
          subCatId: id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Delete Response', response);
        // Remove the deleted doctor from the state
        const updatedUsers = users.filter(user => user.erid !== erid);
        setUsers(updatedUsers);
        console.log(data.message); // Log the success message
      } else {
        console.error('Error deleting doctor:', data);
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async userId => {
      AsyncStorage.getItem('userdata')
        .then(data => {
          if (data) {
            const userData = JSON.parse(data);
            const userId = userData.responseData.user_id;

            // Fetch data from the API using the retrieved userId
            const ApiUrl = `${BASE_URL}${'/eyereport/getAllCampReport'}`;
            return fetch(ApiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: userId, // Use the retrieved userId
                subCatId: id, // Replace with your subcategory ID
              }),
            })
              .then(response => response.json())
              .then(responseData => {
                // console.log("res data",responseData);
                setUsers(responseData);
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
    };

    // AsyncStorage.getItem('userdata')
    //   .then((data) => {
    //     if (data) {
    //       const userData = JSON.parse(data);
    //       const userId = userData.responseData.user_id;
    //       // Call fetchData with the retrieved userId
    //       console.log("Getting user id:", userId)
    //       fetchData(userId);
    //     } else {
    //       console.log('Invalid or missing data in AsyncStorage');
    //     }
    //   })
    //   .catch((error) => {
    //     console.error('Error retrieving data:', error);
    //   });

    const interval = setInterval(fetchData, 500); // Run the fetchData function every 1 second

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, [id]);

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.columnHeader}>Name</Text>
      <Text style={styles.columnHeader}>Date</Text>
      <Text style={styles.columnHeader}>Actions</Text>
    </View>
  );

  // Filter users based on the search text
  const filteredUsers = users.filter(user =>
    searchText.length >= 3
      ? user.doc_name1?.toLowerCase().includes(searchText.toLowerCase())
      : true,
  );
  const ProfileUrl = `${BASE_URL}${'/uploads/profile/'}`;

  // Render user item
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
          <Text style={styles.userInfoText}>{item.doc_name1}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}> {item.camp_date}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleInfo(item.erid)}>
            <IconButton icon="information" iconColor="#0a94d6" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <IconButton
              icon="square-edit-outline"
              iconColor="#222"
              size={20}
              onPress={() => handleEdit(item.erid)}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <IconButton
              icon="delete"
              iconColor="#dc222d"
              size={20}
              onPress={() => handleDelete(item.erid)}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerMain}>
        <View style={styles.headertop}>
          <LinearGradient colors={['#000953', '#092d4f']} style={styles.addbtn}>
            <Button
              icon="plus"
              elevation={4}
              // mode="contained"
              style={styles.addbtn1}
              labelStyle={styles.addbtnText}
              onPress={() => navigation.navigate('DEAddCampReport', {id})}>
              Add Report
            </Button>
          </LinearGradient>
        </View>
        <View style={styles.header}>
          <Searchbar
            placeholder="Search"
            onChangeText={handleSearchTextChange}
            value={searchText}
            style={styles.searchbarStyle}
          />
        </View>
      </View>
      <View style={styles.fullcont}>
      <TableHeader />
      <View style={styles.tableCont}>
       
        {isLoading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#000953" />
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={item => (item ? item.erid.toString() : '0')} // Updated keyExtractor
          />
        )}
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullcont:{
    backgroundColor: '#fff',
    flex: 1,
  },
  searchbarStyle: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000953',
  },
  container: {
    backgroundColor: '#9cbddd',
    flex: 1,
  },
  headerMain: {
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
  addbtn: {
    backgroundColor: '#000953',
    paddingLeft: 1,
    paddingRight: 1,
    color: '#fff',
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 10,
    width: '42%',
  },

  addbtnText: {
    color: '#fff', // Set the text color here
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
    paddingLeft:20,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  userInfoText: {
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingVertical: 6,
    marginLeft: 1,
  },
  actionButtonText: {
    color: 'white',
  },
});

export default DEReportList;
