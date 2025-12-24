import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
// import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Animated, Easing, Image, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { RootStackParamList } from '../navigation/types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';



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
        image: selectedImage || '',
        latitude: confirmedLocation.latitude,
        longitude: confirmedLocation.longitude,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        isValidated: true,
        ratingAvg: 0,
        reviewsCount: 0,
      });

      alert('Spot published successfully');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      alert('Error while publishing spot');
    } finally {
      setPublishing(false);
    }
  };


  return (
    <View style={{ flex: 1, backgroundColor: '#F4F7FE' }}>
      {/* <View style={styles.shadowWrapper} pointerEvents="none">
        <LinearGradient
          colors={["#246BFD", "#246BFD00"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.bottomShadow}
        />
      </View> */}
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#246BFD" />
        </TouchableOpacity>
        <Text style={styles.title}>Add a new spot</Text>
        <View style={styles.photosRow}>
          <TouchableOpacity style={[styles.addPhotoCircle, styles.actionBtn, styles.shadowBtn]} onPress={pickImage}>
            <Ionicons name="cloud-upload-outline" size={28} color="#246BFD" />
            <Text style={styles.actionBtnText}>Galerie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addPhotoCircle, styles.actionBtn, styles.shadowBtn]} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={28} color="#246BFD" />
            <Text style={styles.actionBtnText}>Photo</Text>
          </TouchableOpacity>
          {selectedImage ? (
            <View style={styles.selectedImageWrapper}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
                <Ionicons name="close-circle" size={22} color="#FF4B4B" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={32} color="#B0B0B0" />
            </View>
          )}
        </View>
        {cameraError && (
          <Text style={{ color: '#FF4B4B', textAlign: 'center', marginBottom: 8 }}>{cameraError}</Text>
        )}
        <Text style={styles.photoHint}>Add at least 3 photos of the spot</Text>
        <Text style={styles.label}>Spot Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter spot name"
          placeholderTextColor="#B0B0B0"
          value={spotName}
          onChangeText={setSpotName}
        />

        <Text style={styles.label}>Category</Text>
        <TouchableOpacity style={styles.inputRow} onPress={() => setShowCategoryList(!showCategoryList)}>
          <Text style={[styles.inputText, { color: category ? '#231934' : '#B0B0B0' }]}> {category || 'Select a category'} </Text>
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
              </TouchableOpacity>
            ))}
          </View>
        )}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about this hidden spot..."
          placeholderTextColor="#B0B0B0"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Location</Text>
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
          <TouchableOpacity style={styles.fabBtn} onPress={() => { setShowHint(true); setLocation(null); setConfirmedLocation(null); }}>
            <Ionicons name="refresh" size={22} color="#fff" />
          </TouchableOpacity>
          {location && !confirmedLocation && (
            <TouchableOpacity style={styles.confirmBtn} onPress={() => setConfirmedLocation(location)}>
              <Text style={styles.confirmBtnText}>Confirm location</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.publishBtn}
          onPress={handlePublishSpot}
          disabled={publishing}
        >


          <Text style={styles.publishBtnText}>
            {publishing ? 'Publishing...' : 'Publish Spot'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBarWrapper: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 8,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#231934',
    shadowColor: '#246BFD',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchLoading: {
    position: 'absolute',
    right: 18,
    top: 12,
    color: '#246BFD',
    fontWeight: '700',
    fontSize: 16,
  },
  confirmBtn: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    backgroundColor: '#246BFD',
    borderRadius: 18,
    paddingHorizontal: 28,
    paddingVertical: 12,
    shadowColor: '#246BFD',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  coordsPreviewConfirmed: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: '#E8F1FF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#246BFD',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  mapContainer: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#8AB6FF',
    justifyContent: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapHintBubble: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#246BFD',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  mapHintText: {
    color: '#246BFD',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  coordsPreview: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#246BFD',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  coordsText: {
    color: '#246BFD',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
  fabBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#FF4B4B',
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4B4B',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  shadowBtn: {
    shadowColor: '#246BFD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  backBtn: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 18,
    color: '#231934',
    alignSelf: 'center',
  },
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
    justifyContent: 'center',
  },
  addPhotoCircle: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#246BFD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtn: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  actionBtnText: {
    fontSize: 13,
    color: '#246BFD',
    marginTop: 2,
    fontWeight: '600',
  },
  selectedImageWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: {
    color: '#7A7A7A',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
    color: '#231934',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#231934',
    backgroundColor: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  inputText: {
    fontSize: 14,
    color: '#231934',
  },
  categoryList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  categoryItemSelected: {
    backgroundColor: '#E8F1FF',
  },
  categoryText: {
    fontSize: 14,
    color: '#231934',
  },
  categoryTextSelected: {
    color: '#246BFD',
    fontWeight: '700',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  publishBtn: {
    marginTop: 24,
    backgroundColor: '#246BFD',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  publishBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  shadowWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
    zIndex: -1,
  },
  bottomShadow: {
    flex: 1,
    opacity: 0.5,
  },
});
