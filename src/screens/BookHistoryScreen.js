import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import getUserBookings from '../hooks/getUserBookings';
import Loading from '../components/Loading';

export default function BookHistoryScreen() {
  const { userBookings, loading } = getUserBookings();

  const formatDate = (timestamp) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    const formattedDate = new Date(timestamp).toLocaleString('en-US', options);
    return formattedDate;
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookingItem}>
      <View style={styles.bookingHeader}>
        <Text style={styles.timestampText}>{formatDate(item.timestamp)}</Text>
        <Text style={styles.ridePrice}>{item.ridePrice}</Text>
      </View>

      <View style={styles.bookingInfo}>
        <View>
          <Text  style={{marginTop: 12, marginBottom: 6, fontSize: 16,}}>🔵 Pickup Location:</Text>
          <Text style={styles.locationText}>{item.pickupLocation}</Text>
        </View>
        <View>
          <Text style={{marginTop: 12, marginBottom: 6, fontSize: 16,}}>📍Dropoff Location:</Text>
          <Text style={styles.locationText}>{item.dropoffLocation}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bookingContainer}>
        {loading ? (
          <Loading />
        ) : userBookings.length > 0 ? (
          <FlatList
            data={userBookings}
            keyExtractor={(item, index) => item.bookingId || index.toString()}
            renderItem={renderItem}
          />
        ) : (
          <Text style={styles.noBookingText}>
            {userBookings.length === 0 ? "You haven't booked a ride yet." : "No booking information found."}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bookingContainer: {
    flex: 1,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  noBookingText: {
    textAlign: 'center',
    marginTop: 10,
  },
  bookingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  timestampText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ridePrice: {
    fontSize: 16,
  },
  bookingInfo: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: 14,
    width: '80%'
  },
  bookingButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
