


import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';

import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../firebase/firebase';

import { HomeStackParamList } from '../navigation/HomeStackNavigator';
import { Place, RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

export const options = {
  headerShown: false,
};

const categories = [
  { label: 'Popular', icon: 'star' }, 
  { label: 'Coffee Shop', icon: 'cafe' },
  { label: 'Restaurant', icon: 'restaurant' },
  { label: 'Secret Spot', icon: 'eye-off' },
  { label: 'Park', icon: 'leaf' },
  { label: 'Museum', icon: 'color-palette' },
  { label: 'Bar', icon: 'beer' },
  { label: 'Study Spots', icon: 'book' },
];

type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // 🔹 STATES
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [spots, setSpots] = useState<Place[]>([]);
  const [favStates, setFavStates] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState<string | null>(null);
  
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'spots' | 'users'>('spots');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // 🔹 FAVORITE (sauvegardé dans Firestore)
  const handleFavorite = async (idx: number) => {
    const user = auth.currentUser;
    if (!user) return;

    const spot = spots[idx];
    const isCurrentlyLiked = favStates[idx];

    try {
      if (isCurrentlyLiked) {
        // Unlike: supprimer de Firestore
        const likesQuery = query(
          collection(db, 'likes'),
          where('userId', '==', user.uid),
          where('spotId', '==', spot.id)
        );
        const snapshot = await getDocs(likesQuery);
        snapshot.docs.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, 'likes', docSnapshot.id));
        });
      } else {
        // Like: ajouter à Firestore
        await addDoc(collection(db, 'likes'), {
          userId: user.uid,
          spotId: spot.id,
          createdAt: serverTimestamp(),
        });
      }

      // Mettre à jour l'état local
      setFavStates(prev => {
        const copy = [...prev];
        copy[idx] = !copy[idx];
        return copy;
      });
    } catch (error) {
      console.error('Error handling favorite:', error);
    }
  };

  // =========================
  // 🔹 FETCH USER FIRST NAME
  // =========================
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const userData = snap.data();
          setFirstName(userData.firstName);
        }
      } catch (e) {
        console.log('Erreur user:', e);
      }
    };

    fetchUser();
  }, []);

  // =========================
  // 🔹 FETCH SPOTS FROM FIRESTORE
  // =========================
  useFocusEffect(
    useCallback(() => {
      const fetchSpots = async () => {
      try {
        const q = query(
          collection(db, 'spots'),
          where('isValidated', '==', true)
        );

        const snapshot = await getDocs(q);

        // Charger les données des spots avec infos des créateurs
        const spotsData: Place[] = await Promise.all(
          snapshot.docs.map(async docSnapshot => {
            const data = docSnapshot.data();

            // Charger les infos du créateur
            let creatorInfo = undefined;
            if (data.createdBy) {
              try {
                const userDoc = await getDoc(doc(db, 'users', data.createdBy));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  creatorInfo = {
                    id: data.createdBy,
                    firstName: userData.firstName || 'Unknown',
                    photoURL: userData.photoURL || null,
                  };
                }
              } catch (err) {
                console.log('Error loading creator info:', err);
              }
            }

            return {
              id: docSnapshot.id,
              name: data.name,
              city: data.city || data.category || '',
              image: data.images && Array.isArray(data.images) && data.images.length > 0
                ? { uri: data.images[0] }
                : undefined,
              rating: data.ratingAvg ?? 0,
              latitude: data.latitude,
              longitude: data.longitude,
              category: data.category,
              description: data.description,
              favorite: false,
              openingHours: data.openingHours ?? '',
              address: data.address ?? '',
              amenities: data.amenities ?? [],
              priceRange: data.priceRange ?? 'Not specified',
              creator: creatorInfo,
            };
          })
        );

        setSpots(spotsData);
        
        // Charger les likes de l'utilisateur
        const user = auth.currentUser;
        if (user) {
          const likesQuery = query(
            collection(db, 'likes'),
            where('userId', '==', user.uid)
          );
          const likesSnapshot = await getDocs(likesQuery);
          const likedSpotIds = likesSnapshot.docs.map(doc => doc.data().spotId);
          
          // Initialiser favStates en fonction des likes
          const initialFavStates = spotsData.map(spot => likedSpotIds.includes(spot.id));
          setFavStates(initialFavStates);
        } else {
          setFavStates(spotsData.map(() => false));
        }
      } catch (e) {
        console.log('Erreur spots:', e);
      } finally {
        setLoading(false);
      }
    };

      fetchSpots();
    }, [])
  );

  // =========================
  // 🔹 MODAL SEARCH FUNCTION
  // =========================
  const handleModalSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      if (searchType === 'spots') {
        // Rechercher dans les spots
        const results = spots.filter(spot =>
          spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spot.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spot.city.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(spot => ({
          id: spot.id,
          name: spot.name,
          category: spot.category,
          city: spot.city,
          image: spot.image?.uri,
          rating: spot.rating,
        }));
        console.log('Search results for spots:', results.length);
        setSearchResults(results);
      } else {
        // Rechercher dans les utilisateurs
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const results = usersSnapshot.docs
          .map(doc => ({
            id: doc.id,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
            username: doc.data().username,
            photoURL: doc.data().photoURL,
          }))
          .filter(user => {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
            const username = (user.username || '').toLowerCase();
            const query = searchQuery.toLowerCase();
            return fullName.includes(query) || username.includes(query);
          });
        console.log('Search results for users:', results.length);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleModalSearch();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType]);

  // =========================
  // 🔹 FILTERED SPOTS (nom + catégorie + ville)
  // =========================
  // Générer code aéroport à partir du nom de la ville
  const generateAirportCode = (cityName: string) => {
    return cityName.substring(0, 3).toUpperCase();
  };

  // Filtrer les spots
  const filteredSpots = spots.filter((place) => {
    const searchLower = search.toLowerCase();
    const selectedCategory = categories[activeCategory].label;
    const matchCategory =
      selectedCategory === 'Popular' ||
      place.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      place.name.toLowerCase().includes(searchLower) ||
      place.category.toLowerCase().includes(searchLower) ||
      place.city.toLowerCase().includes(searchLower);
    return matchCategory && matchSearch;
  }).sort((a, b) => {
    // Si "Popular" est sélectionné, trier par rating décroissant
    if (categories[activeCategory].label === 'Popular') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  // =========================
  // 🔹 LOADING
  // =========================
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          Chargement des spots...
        </Text>
      </SafeAreaView>
    );
  }

  // =========================
  // 🔹 UI
  // =========================
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Popular</Text>
            <Text style={styles.titleSecond}>destination</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuBtn}
            onPress={() => setShowSearchModal(true)}
          >
            <Ionicons name="search" size={24} color="#1A1A2E" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Category & Filters Row */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.categoryBtn}>
              <Text style={styles.categoryBtnText}>{categories[activeCategory].label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#1A1A2E" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filtersBtn}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons name="options-outline" size={18} color="#fff" />
              <Text style={styles.filtersBtnText}>Filters</Text>
            </TouchableOpacity>
          </View>

          {/* Categories Horizontal Scroll */}
          {showFilters && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {categories.map((cat, idx) => (
                <TouchableOpacity
                  key={cat.label}
                  style={[
                    styles.categoryChip,
                    activeCategory === idx && styles.categoryChipActive
                  ]}
                  onPress={() => setActiveCategory(idx)}
                >
                  <Ionicons 
                    name={cat.icon as any} 
                    size={16} 
                    color={activeCategory === idx ? '#fff' : '#1A1A2E'} 
                  />
                  <Text style={[
                    styles.categoryChipText,
                    activeCategory === idx && styles.categoryChipTextActive
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Destination Cards */}
          <View style={styles.cardsContainer}>
            {filteredSpots.map((place, idx) => (
              <TouchableOpacity
                key={place.id}
                activeOpacity={0.9}
                onPress={() => {
                  const parent = navigation.getParent();
                  if (parent) {
                    parent.navigate('PlaceDetails', { place });
                  }
                }}
                style={styles.destinationCard}
              >
                <ImageBackground
                  source={place.image}
                  style={styles.cardBackground}
                  imageStyle={styles.cardImage}
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
                    style={styles.cardGradient}
                  >
                    {/* Header with code and price */}
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.airportCode}>{generateAirportCode(place.city || place.name)}</Text>
                        <Text style={styles.citySmall}>{place.city}</Text>
                      </View>
                      {place.priceRange && place.priceRange !== 'Not specified' && (
                        <View style={styles.priceTag}>
                          <Text style={styles.priceText}>
                            {place.priceRange === 'Free' ? 'Free' : place.priceRange}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Middle Section - City name */}
                    <View style={styles.cardMiddle}>
                      <Text style={styles.cityName}>{place.name}</Text>
                      <Text style={styles.cityDescription}>
                        {place.description?.substring(0, 60) || 'Discover this amazing place'}
                      </Text>
                      {place.rating > 0 && (
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                        </View>
                      )}
                    </View>

                    {/* Footer with creator info */}
                    <View style={styles.cardFooter}>
                      {place.creator ? (
                        <TouchableOpacity
                          style={styles.creatorInfo}
                          onPress={() => navigation.navigate('UserProfile', { userId: place.creator!.id })}
                        >
                          <Image
                            source={
                              place.creator.photoURL
                                ? { uri: place.creator.photoURL }
                                : require('../../assets/images/profile-avatar.png')
                            }
                            style={styles.creatorAvatar}
                          />
                          <Text style={styles.creatorName}>{place.creator.firstName}</Text>
                          <Ionicons name="arrow-forward" size={18} color="#1A1A2E" style={styles.creatorArrow} />
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.letsGoBtn}>
                          <Text style={styles.letsGoText}>Let's go</Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSearchModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowSearchModal(false);
            setSearchQuery('');
            setSearchResults([]);
          }}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Search</Text>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => {
                    setShowSearchModal(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <Ionicons name="close" size={24} color="#1A1A2E" />
                </TouchableOpacity>
              </View>
              
              {/* Search Type Toggle */}
              <View style={styles.searchToggle}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  searchType === 'spots' && styles.toggleBtnActive,
                ]}
                onPress={() => setSearchType('spots')}
              >
                <Ionicons 
                  name="location" 
                  size={18} 
                  color={searchType === 'spots' ? '#001031ff' : '#666'} 
                />
                <Text
                  style={[
                    styles.toggleText,
                    searchType === 'spots' && styles.toggleTextActive,
                  ]}
                >
                  Spots
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  searchType === 'users' && styles.toggleBtnActive,
                ]}
                onPress={() => setSearchType('users')}
              >
                <Ionicons 
                  name="people" 
                  size={18} 
                  color={searchType === 'users' ? '#000e29ff' : '#666'} 
                />
                <Text
                  style={[
                    styles.toggleText,
                    searchType === 'users' && styles.toggleTextActive,
                  ]}
                >
                  Users
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Input */}
          <View style={styles.modalSearchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.modalSearchIcon} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder={searchType === 'spots' ? 'Search spots by name...' : 'Search users by name...'}
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Results */}
          <ScrollView style={styles.modalResultsContainer}>
            {searchLoading ? (
              <View style={styles.modalLoadingContainer}>
                <Text style={styles.modalLoadingText}>Searching...</Text>
              </View>
            ) : searchQuery.length === 0 ? (
              <View style={styles.modalEmptyContainer}>
                <Ionicons 
                  name="search-outline" 
                  size={64} 
                  color="#ccc" 
                />
                <Text style={styles.modalEmptyText}>
                  Start typing to search
                </Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.modalEmptyContainer}>
                <Ionicons 
                  name={searchType === 'spots' ? 'location-outline' : 'people-outline'} 
                  size={64} 
                  color="#ccc" 
                />
                <Text style={styles.modalEmptyText}>
                  No {searchType === 'spots' ? 'spots' : 'users'} found
                </Text>
              </View>
            ) : (
              <View style={styles.modalResults}>
                {searchType === 'spots' ? (
                  searchResults.map((spot) => (
                    <TouchableOpacity
                      key={spot.id}
                      style={styles.modalResultItem}
                      onPress={() => {
                        const fullSpot = spots.find(s => s.id === spot.id);
                        if (fullSpot) {
                          const parent = navigation.getParent();
                          if (parent) {
                            parent.navigate('PlaceDetails', { place: fullSpot });
                          }
                          setShowSearchModal(false);
                          setSearchQuery('');
                        }
                      }}
                    >
                      <Image
                        source={spot.image ? { uri: spot.image } : require('../../assets/images/place1.jpg')}
                        style={styles.modalResultImage}
                      />
                      <View style={styles.modalResultInfo}>
                        <Text style={styles.modalResultName}>{spot.name}</Text>
                        <Text style={styles.modalResultSubtext}>{spot.category} • {spot.city}</Text>
                        {spot.rating > 0 && (
                          <View style={styles.modalResultRating}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.modalResultRatingText}>{spot.rating.toFixed(1)}</Text>
                          </View>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                  ))
                ) : (
                  searchResults.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={styles.modalResultItem}
                      onPress={() => {
                        navigation.navigate('UserProfile', { userId: user.id });
                        setShowSearchModal(false);
                        setSearchQuery('');
                      }}
                    >
                      <Image
                        source={
                          user.photoURL
                            ? { uri: user.photoURL }
                            : require('../../assets/images/profile-avatar.png')
                        }
                        style={styles.modalResultAvatar}
                      />
                      <View style={styles.modalResultInfo}>
                        <Text style={styles.modalResultName}>
                          {user.firstName} {user.lastName}
                        </Text>
                        {user.username && (
                          <Text style={styles.modalResultSubtext}>@{user.username}</Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#E8ECF4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: '400',
    color: '#1A1A2E',
    lineHeight: 46,
  },
  titleSecond: {
    fontSize: 40,
    fontWeight: '400',
    color: '#1A1A2E',
    lineHeight: 46,
  },
  menuBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    paddingHorizontal: 24,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  categoryBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  filtersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  filtersBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#1A1A2E',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  cardsContainer: {
    gap: 16,
    paddingBottom: 32,
  },
  destinationCard: {
    width: '100%',
    height: 420,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardBackground: {
    width: '100%',
    height: '100%',
  },
  cardImage: {
    borderRadius: 24,
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  airportCode: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 1,
  },
  citySmall: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  priceTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  cardMiddle: {
    flex: 1,
    justifyContent: 'center',
  },
  cityName: {
    fontSize: 32,
    fontWeight: '400',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 38,
  },
  cityDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  letsGoBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  letsGoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    gap: 10,
    alignSelf: 'flex-start',
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  creatorArrow: {
    marginLeft: 4,
    color: '#1A1A2E',
  },
  arrowBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8ECF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  searchToggle: {
    flexDirection: 'row',
    backgroundColor: '#E8ECF4',
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#000c24ff',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8ECF4',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  modalSearchIcon: {
    marginRight: 10,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A2E',
  },
  modalResultsContainer: {
    flex: 1,
    marginTop: 20,
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  modalLoadingText: {
    fontSize: 16,
    color: '#999',
  },
  modalEmptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  modalResults: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8ECF4',
  },
  modalResultImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  modalResultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#E8ECF4',
  },
  modalResultInfo: {
    flex: 1,
  },
  modalResultName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  modalResultSubtext: {
    fontSize: 13,
    color: '#666',
  },
  modalResultRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  modalResultRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
  },
});

export default HomeScreen;