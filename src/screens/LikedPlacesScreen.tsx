import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebase/firebase';
import { Place, RootStackParamList } from '../navigation/types';

export default function LikedPlacesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [likedPlaces, setLikedPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLikedPlaces();
  }, []);

  const loadLikedPlaces = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Loading likes for user:', user.uid);
      
      // Récupérer tous les likes de l'utilisateur
      const likesQuery = query(
        collection(db, 'likes'),
        where('userId', '==', user.uid)
      );
      const likesSnapshot = await getDocs(likesQuery);
      console.log('Likes found:', likesSnapshot.size);

      // Récupérer les détails de chaque spot liké
      const places: Place[] = [];
      for (const likeDoc of likesSnapshot.docs) {
        const spotId = likeDoc.data().spotId;
        try {
          console.log('Fetching spot:', spotId);
          
          const spotDocRef = doc(db, 'spots', spotId);
          const spotDoc = await getDoc(spotDocRef);
          
          if (spotDoc.exists()) {
            const data = spotDoc.data();
            console.log('Spot loaded:', data.name);
            
            places.push({
              id: spotDoc.id,
              name: data.name || '',
              city: data.city || '',
              rating: data.ratingAvg || 0,
              favorite: true,
              image: data.images && Array.isArray(data.images) && data.images.length > 0
                ? { uri: data.images[0] }
                : undefined,
              address: data.address || '',
              description: data.description || '',
              openingHours: data.openingHours || '',
              latitude: data.latitude || 0,
              longitude: data.longitude || 0,
              category: data.category || '',
              amenities: data.amenities || [],
              priceRange: data.priceRange || 'Not specified',
            });
          } else {
            console.log('Spot not found or no access:', spotId);
          }
        } catch (spotError) {
          console.log('Spot not accessible (not validated or deleted):', spotId);
          // Continue avec les autres spots - certains spots peuvent être non validés ou supprimés
        }
      }

      console.log('Total places loaded:', places.length);
      setLikedPlaces(places);
    } catch (error) {
      console.error('Error loading liked places:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#1A1A2E', '#000000ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="heart" size={32} color="#fbfbfbff" style={styles.headerIcon} />
          <Text style={styles.title}>My Favorites</Text>
          <Text style={styles.subtitle}>{likedPlaces.length} {likedPlaces.length === 1 ? 'place' : 'places'}</Text>
        </View>
      </LinearGradient>
      
      {loading ? (
        <View style={styles.emptyBox}>
          <ActivityIndicator size="large" color="#246BFD" />
          <Text style={styles.emptyText}>Loading your favorites...</Text>
        </View>
      ) : likedPlaces.length === 0 ? (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="heart-dislike-outline" size={64} color="#246BFD" />
          </View>
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>Start exploring and save your favorite places!</Text>
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
              {item.image ? (
                <Image source={item.image} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Ionicons name="image-outline" size={40} color="#246BFD" />
                </View>
              )}
              <View style={styles.infoBox}>
                <Text style={styles.placeName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.rowInfo}>
                  <Ionicons name="location" size={14} color="#246BFD" />
                  <Text style={styles.placeLocation} numberOfLines={1}>{item.city}</Text>
                </View>
                <View style={styles.rowInfo}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.placeRating}>{item.rating.toFixed(1)}</Text>
                  {item.priceRange && item.priceRange !== 'Not specified' && (
                    <>
                      <View style={styles.dot} />
                      <Text style={styles.priceText}>{item.priceRange}</Text>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.heartWrapper}>
                <Ionicons name="heart" size={24} color="#FF4B4B" />
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8ECF4',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 16,
    marginRight: 14,
  },
  imagePlaceholder: {
    backgroundColor: '#E8ECF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  placeLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  placeRating: {
    fontSize: 14,
    color: '#1A1A2E',
    fontWeight: '600',
    marginLeft: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#999',
    marginHorizontal: 8,
  },
  priceText: {
    fontSize: 13,
    color: '#246BFD',
    fontWeight: '600',
  },
  heartWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
