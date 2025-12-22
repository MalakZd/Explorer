import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';

// Dummy data for liked places
const likedPlaces = [
  {
    id: '1',
    name: 'Dat El Yaqout',
    city: 'Marrakech, Morocco',
    rating: 4.8,
    favorite: true,
    image: require('../../assets/images/place1.jpg'),
  },
  {
    id: '2',
    name: 'Majorelle Garden',
    city: 'Marrakech, Morocco',
    rating: 4.7,
    favorite: true,
    image: require('../../assets/images/place2.jpg'),
  },
  // Add more places as needed
];

export default function LikedPlacesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liked Places</Text>
      {likedPlaces.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="heart-dislike-outline" size={60} color="#246BFD" />
          <Text style={styles.emptyText}>You haven't liked any places yet.</Text>
        </View>
      ) : (
        <FlatList
          data={likedPlaces}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('PlaceDetails', { place: item })}
            >
              <Image source={item.image} style={styles.image} />
              <View style={styles.infoBox}>
                <Text style={styles.placeName}>{item.name}</Text>
                <View style={styles.rowInfo}>
                  <Ionicons name="location-outline" size={15} color="#246BFD" style={{ marginRight: 4 }} />
                  <Text style={styles.placeLocation}>{item.city}</Text>
                </View>
                <View style={styles.rowInfo}>
                  <Ionicons name="star" size={15} color="#FFD700" style={{ marginRight: 4 }} />
                  <Text style={styles.placeRating}>{item.rating}</Text>
                </View>
              </View>
              <Ionicons name="heart" size={26} color="#FF4B4B" style={styles.heartIcon} />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FE',
    paddingTop: 48,
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#246BFD',
    marginBottom: 18,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    marginBottom: 18,
    padding: 14,
    shadowColor: '#246BFD',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#F2F2F2',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoBox: {
    flex: 1,
    justifyContent: 'center',
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  placeRating: {
    fontSize: 14,
    color: '#231934',
    fontWeight: '600',
    marginLeft: 2,
  },
  placeName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#231934',
  },
  placeLocation: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  heartIcon: {
    marginLeft: 8,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 18,
    textAlign: 'center',
  },
});
