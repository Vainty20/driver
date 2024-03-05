import React, { useState, useE} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, ActivityIndicator ,Alert} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Map from '../components/Map';
import findUserData from '../hooks/findUserData';
import getUserData from '../hooks/getUserData';
import { Toast } from 'toastify-react-native'; 
import { useNavigation } from '@react-navigation/native';

export default function BookConfirmScreen({ route }) {
  const navigation = useNavigation();
  const { id, location, locationCoordinates, userId, pickupLocation, pickupCoordinates, dropoffLocation, dropoffCoordinates, rideDistance, rideTime, ridePrice, driverId } = route.params;
  const { userData, loading: userDataLoading } = findUserData({ userId });
  const { userData: currentUser } = getUserData();
  const [loading, setLoading] = useState(false);
  const [isPickupConfirmed, setIsPickupConfirmed] = useState(false);
  const [confirmDropoff, setConfirmDropoff] = useState(false);

  const handleBookConfirm = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const bookDocRef = doc(db, 'book', id);
      await updateDoc(bookDocRef, {
        driverId: auth.currentUser.uid,
      });
      Toast.success("Booking confirmed");
      setIsPickupConfirmed(true);
    } catch (error) {
      Toast.error('Error confirming booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookDropoff = async () => {
    Alert.alert(
      "Confirm Drop-off",
      "Are you sure you want to drop off?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: async () => {
            const bookDocRef = doc(db, 'book', id);
            await updateDoc(bookDocRef, {
              isDropoff: true,
            });
            setConfirmDropoff(true);
            navigation.goBack();
          }
        }
      ],
      { cancelable: false }
    );
  };

  
  return (
    <SafeAreaView style={styles.container}>
      <Map origin={location} originCoords={locationCoordinates} 
       destination={driverId ? dropoffLocation: pickupLocation}
       destinationCoords={driverId ? dropoffCoordinates : pickupCoordinates} />
      <View style={styles.contentContainer}>
        <View style={styles.cardContainer}>
          <View style={styles.rideInfoContainer}>
            <View style={styles.rideInfoDiv}>
              <Ionicons name="speedometer-outline" size={18} />
              <Text>{rideDistance}</Text>
            </View>
            <View style={styles.rideInfoDiv}>
              <Ionicons name="time-outline" size={18} />
              <Text>{rideTime}</Text>
            </View>
          </View>
          <View style={styles.locationContainer}>
            <View style={styles.locationDiv}>
              <Image
                style={styles.profilePic}
                source={{ uri: (userData && userData.profilePicture) || 'https://i.stack.imgur.com/l60Hf.png' }}
              />
              <Text>{pickupLocation}</Text>
            </View>
            <View style={styles.separate}>
              <Ionicons name="arrow-down-outline" size={18} />
              <View style={styles.separateLine} />
            </View>
            <View style={styles.locationDiv}>
              <Ionicons name="location-outline" size={32} />
              <Text>{dropoffLocation}</Text>
            </View>
          </View>
          <Text>Total of <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{ridePrice}</Text></Text>
          <TouchableOpacity onPress={()=> navigation.push("FareMatrix")}>
              <Text>View our Fare Matrix</Text>
            </TouchableOpacity>
          {!driverId ? (
            <TouchableOpacity style={styles.button} disabled={loading} onPress={handleBookConfirm}>
              <Text style={styles.buttonText}>{loading ? <ActivityIndicator size={25} color="white" /> : 'Pickup'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.dropoffButton} disabled={loading} onPress={handleBookDropoff}>
              <Text style={styles.buttonText}>{loading ? <ActivityIndicator size={25} color="white" /> : 'Dropoff'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 20,
    padding: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 6,
    color: '#5c5c5c'
  },
  locationContainer: {
    padding: 15,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 12,
  },
  locationDiv: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
    paddingVertical: 6,
    gap: 12
  },
  separate: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 2,
  },
  separateLine: {
    width: '90%',
    height: 1,
    backgroundColor: 'gray'
  },
  profilePic: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: 'gray',
    borderRadius: 50,
  },
  rideInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  rideInfoDiv: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 12,
    width: '100%',
  },
  dropoffButton: {
    alignItems: 'center',
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold'
  },
});
