import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Animated, Easing, Image, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { auth, db } from '../firebase/firebase';
import { RootStackParamList } from '../navigation/types';

const availableAmenities = [
  { id: 'wifi', icon: 'wifi', label: 'Wi-Fi', component: 'Ionicons' },
  { id: 'parking', icon: 'car', label: 'Parking', component: 'Ionicons' },
  { id: 'food', icon: 'restaurant', label: 'Food', component: 'Ionicons' },
  { id: 'coffee', icon: 'cafe', label: 'Café', component: 'Ionicons' },
  { id: 'outdoor', icon: 'leaf', label: 'Outdoor', component: 'Ionicons' },
  { id: 'pet', icon: 'paw', label: 'Pet Friendly', component: 'Ionicons' },
  { id: 'music', icon: 'musical-notes', label: 'Music', component: 'Ionicons' },
  { id: 'accessible', icon: 'accessibility', label: 'Accessible', component: 'Ionicons' },
];

export default function AddSpotScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [spotName, setSpotName] = useState('');
  const [description, setDescription] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState('');
  const [showPriceList, setShowPriceList] = useState(false);

  const [region, setRegion] = useState({
    latitude: 48.8584,
    longitude: 2.2945,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const markerAnim = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);

  // Pulse animation for marker
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  };
  const categories = [
    'Coffee Shop',
    'Restaurant',
    'Secret Spot',
    'Park',
    'Museum',
    'Bar',
    'Other',
  ];

  const pickImage = async () => {
    setCameraError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    setCameraError(null);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setCameraError('Camera permission is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };
  const handlePublishSpot = async () => {
    if (!spotName || !category || !description || !confirmedLocation) {
      alert('Please fill all required fields');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('User not authenticated');
      return;
    }

    try {
      setPublishing(true);

      await addDoc(collection(db, 'spots'), {
        name: spotName,
        category,
        description,
        images: selectedImage ? [selectedImage] : [],
        latitude: confirmedLocation.latitude,
        longitude: confirmedLocation.longitude,
        amenities: selectedAmenities,
        priceRange: priceRange || 'Not specified',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        isValidated: true,
        ratingAvg: 0,
        reviewsCount: 0,
      });

      alert('Spot published successfully');
      navigation.navigate('Main'); // kirj3 l home screen une fois n publisher 
    } catch (e) {
      console.error(e);
      alert('Error while publishing spot');
    } finally {
      setPublishing(false);
    }
  };

  const toggleAmenity = (id: string) => {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== id));
    } else {
      setSelectedAmenities([...selectedAmenities, id]);
    }
  };


  return (
    <View style={{ flex: 1, backgroundColor: '#E8ECF4' }}>
      <LinearGradient
        colors={['#1A1A2E', '#E8ECF4']}
        style={styles.headerGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Add a New Spot</Text>
        <Text style={styles.subtitle}>Share your hidden gem with the community</Text>
      </LinearGradient>
      
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="images" size={20} color="#246BFD" />
            <Text style={styles.sectionTitle}>Photos</Text>
          </View>
          <Text style={styles.helpText}>Add at least one photo to showcase this place</Text>
          <View style={styles.photosRow}>
            <TouchableOpacity style={[styles.addPhotoCircle, styles.actionBtn]} onPress={pickImage}>
              <LinearGradient colors={['#246BFD', '#1A56DB']} style={styles.actionBtnGradient}>
                <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                <Text style={styles.actionBtnText}>Gallery</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addPhotoCircle, styles.actionBtn]} onPress={takePhoto}>
              <LinearGradient colors={['#1A1A2E', '#2D2D4A']} style={styles.actionBtnGradient}>
                <Ionicons name="camera-outline" size={24} color="#fff" />
                <Text style={styles.actionBtnText}>Camera</Text>
              </LinearGradient>
            </TouchableOpacity>
            {selectedImage ? (
              <View style={styles.selectedImageWrapper}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
                  <Ionicons name="close-circle" size={24} color="#FF4B4B" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="image-outline" size={32} color="#B0B0B0" />
                <Text style={styles.placeholderText}>Preview</Text>
              </View>
            )}
          </View>
          {cameraError && (
            <Text style={{ color: '#FF4B4B', textAlign: 'center', marginTop: 8, fontSize: 12 }}>{cameraError}</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="create" size={20} color="#246BFD" />
            <Text style={styles.sectionTitle}>Basic Info</Text>
          </View>
          <Text style={styles.label}>Spot Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter spot name"
            placeholderTextColor="#B0B0B0"
            value={spotName}
            onChangeText={setSpotName}
          />

          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity style={styles.inputRow} onPress={() => setShowCategoryList(!showCategoryList)}>
            <Text style={[styles.inputText, { color: category ? '#1A1A2E' : '#B0B0B0' }]}>
              {category || 'Select a category'}
            </Text>
            <Ionicons name={showCategoryList ? 'chevron-up' : 'chevron-down'} size={20} color="#246BFD" />
          </TouchableOpacity>
          {showCategoryList && (
            <View style={styles.categoryList}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryItem, category === cat && styles.categoryItemSelected]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryList(false);
                  }}
                >
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextSelected]}>{cat}</Text>
                  {category === cat && <Ionicons name="checkmark-circle" size={20} color="#246BFD" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about this hidden spot..."
            placeholderTextColor="#B0B0B0"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Price Range</Text>
          <TouchableOpacity style={styles.inputRow} onPress={() => setShowPriceList(!showPriceList)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="cash-outline" size={20} color={priceRange ? '#246BFD' : '#B0B0B0'} />
              <Text style={[styles.inputText, { color: priceRange ? '#1A1A2E' : '#B0B0B0' }]}>
                {priceRange || 'Select price range'}
              </Text>
            </View>
            <Ionicons name={showPriceList ? 'chevron-up' : 'chevron-down'} size={20} color="#246BFD" />
          </TouchableOpacity>
          {showPriceList && (
            <View style={styles.priceList}>
              {['Free', 'Under 50 DH', '50-100 DH', '100-200 DH', '200-500 DH', '500+ DH'].map(price => (
                <TouchableOpacity
                  key={price}
                  style={[styles.priceItem, priceRange === price && styles.priceItemSelected]}
                  onPress={() => {
                    setPriceRange(price);
                    setShowPriceList(false);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="pricetag" size={16} color={priceRange === price ? '#246BFD' : '#7A7A7A'} />
                    <Text style={[styles.priceText, priceRange === price && styles.priceTextSelected]}>{price}</Text>
                  </View>
                  {priceRange === price && <Ionicons name="checkmark-circle" size={20} color="#246BFD" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={20} color="#246BFD" />
            <Text style={styles.sectionTitle}>What This Place Offers</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Select all amenities available</Text>
          <View style={styles.amenitiesGrid}>
            {availableAmenities.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity.id);
              return (
                <TouchableOpacity
                  key={amenity.id}
                  style={[styles.amenityChip, isSelected && styles.amenityChipSelected]}
                  onPress={() => toggleAmenity(amenity.id)}
                >
                  <Ionicons 
                    name={amenity.icon as any} 
                    size={20} 
                    color={isSelected ? '#fff' : '#1A1A2E'} 
                  />
                  <Text style={[styles.amenityChipText, isSelected && styles.amenityChipTextSelected]}>
                    {amenity.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.amenityCheck}>
                      <Ionicons name="checkmark" size={12} color="#246BFD" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#246BFD" />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Text style={styles.helpText}>Search or tap on the map to select location</Text>
        {/* Search bar au-dessus de la carte */}
        <View style={styles.searchBarWrapper}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search a place..."
            placeholderTextColor="#B0B0B0"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={async () => {
              if (!search) return;
              setSearchLoading(true);
              try {
                // Utilisation de Nominatim (OpenStreetMap)
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`;
                const res = await fetch(url, { headers: { 'User-Agent': 'ExplorerApp/1.0' } });
                const data = await res.json();
                if (data && data.length > 0) {
                  const lat = parseFloat(data[0].lat);
                  const lng = parseFloat(data[0].lon);
                  setRegion({
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  });
                  setLocation({ latitude: lat, longitude: lng });
                  setConfirmedLocation(null);
                  setShowHint(false);
                  Animated.sequence([
                    Animated.timing(markerAnim, { toValue: -20, duration: 120, useNativeDriver: true }),
                    Animated.timing(markerAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
                  ]).start();
                  startPulse();
                  Keyboard.dismiss();
                }
              } catch (e) {}
              setSearchLoading(false);
            }}
            returnKeyType="search"
          />
          {searchLoading && <Text style={styles.searchLoading}>...</Text>}
        </View>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={(e: MapPressEvent) => {
              setLocation(e.nativeEvent.coordinate);
              setConfirmedLocation(null);
              setShowHint(false);
              setRegion({
                ...region,
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
              });
              Animated.sequence([
                Animated.timing(markerAnim, { toValue: -20, duration: 120, useNativeDriver: true }),
                Animated.timing(markerAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
              ]).start();
              startPulse();
            }}
          >
            {location && (
              <Marker coordinate={location}>
                <Animated.View style={{ transform: [{ translateY: markerAnim }, { scale: pulseAnim }] }}>
                  <Ionicons name="location" size={42} color="#FF4B4B" style={{ textShadowColor: '#fff', textShadowRadius: 6 }} />
                </Animated.View>
              </Marker>
            )}
            {confirmedLocation && (
              <Marker coordinate={confirmedLocation} pinColor="#246BFD" />
            )}
          </MapView>
          {showHint && (
            <View style={styles.mapHintBubble}>
              <Text style={styles.mapHintText}>Tap on the map to select a location</Text>
            </View>
          )}
          {location && !confirmedLocation && (
            <View style={styles.coordsPreview}>
              <Ionicons name="pin" size={16} color="#246BFD" />
              <Text style={styles.coordsText}>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text>
            </View>
          )}
          {confirmedLocation && (
            <View style={styles.coordsPreviewConfirmed}>
              <Ionicons name="checkmark-circle" size={16} color="#246BFD" />
              <Text style={styles.coordsText}>Location confirmed!</Text>
            </View>
          )}
          {location && !confirmedLocation && (
            <TouchableOpacity style={styles.confirmBtn} onPress={() => setConfirmedLocation(location)}>
              <Text style={styles.confirmBtnText}>Confirm Location</Text>
            </TouchableOpacity>
          )}
        </View>
        </View>
        
        <TouchableOpacity
          style={styles.publishBtn}
          onPress={handlePublishSpot}
          disabled={publishing}
        >
          <LinearGradient colors={['#246BFD', '#1A56DB']} style={styles.publishBtnGradient}>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.publishBtnText}>
              {publishing ? 'Publishing...' : 'Publish Spot'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#7A7A7A',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#7A7A7A',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  photosRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  addPhotoCircle: {
    flex: 1,
  },
  actionBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionBtnGradient: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedImageWrapper: {
    flex: 1,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 100,
    borderRadius: 16,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  photoPlaceholder: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    gap: 4,
  },
  placeholderText: {
    fontSize: 11,
    color: '#B0B0B0',
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#1A1A2E',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1A1A2E',
    backgroundColor: '#F8F9FA',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#F8F9FA',
  },
  inputText: {
    fontSize: 15,
    color: '#1A1A2E',
  },
  categoryList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  categoryItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  categoryItemSelected: {
    backgroundColor: '#F0F7FF',
  },
  categoryText: {
    fontSize: 15,
    color: '#1A1A2E',
  },
  categoryTextSelected: {
    color: '#246BFD',
    fontWeight: '600',
  },
  priceList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  priceItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  priceItemSelected: {
    backgroundColor: '#F0F7FF',
  },
  priceText: {
    fontSize: 15,
    color: '#1A1A2E',
  },
  priceTextSelected: {
    color: '#246BFD',
    fontWeight: '600',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E8ECF4',
    gap: 6,
  },
  amenityChipSelected: {
    backgroundColor: '#246BFD',
    borderColor: '#246BFD',
  },
  amenityChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  amenityChipTextSelected: {
    color: '#fff',
  },
  amenityCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#246BFD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  publishBtnGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  publishBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  searchBarWrapper: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 12,
  },
  searchBar: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    color: '#1A1A2E',
  },
  searchLoading: {
    position: 'absolute',
    right: 16,
    top: 14,
    color: '#246BFD',
    fontWeight: '700',
    fontSize: 14,
  },
  mapContainer: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E8ECF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapHintBubble: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  mapHintText: {
    color: '#1A1A2E',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  coordsPreview: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  coordsText: {
    color: '#246BFD',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 13,
  },
  coordsPreviewConfirmed: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#E8F8F5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#246BFD',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmBtn: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: '#246BFD',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#246BFD',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
