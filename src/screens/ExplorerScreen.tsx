import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Dimensions, ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SearchBar from '../components/SearchBar';

const { width } = Dimensions.get('window');

// les accents et miniscules
function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

//Bima t9ad backend malak

const markers = [
  { id: 1, name: 'Casablanca', category: 'City', country: 'Morocco', coordinate: { latitude: 33.5731, longitude: -7.5898 } },
  { id: 2, name: 'Rabat Coffee', category: 'Coffee Shop', country: 'Morocco', coordinate: { latitude: 34.020882, longitude: -6.84165 } },
  { id: 3, name: 'Marrakech Restaurant', category: 'Restaurant', country: 'Morocco', coordinate: { latitude: 31.6295, longitude: -7.9811 } },
  { id: 4, name: 'Chefchaouen Hidden Spot', category: 'Hidden Spot', country: 'Morocco', coordinate: { latitude: 35.1688, longitude: -5.2636 } },
  { id: 5, name: 'Agadir Coffee', category: 'Coffee Shop', country: 'Morocco', coordinate: { latitude: 30.4278, longitude: -9.5981 } },
  { id: 6, name: 'Fes Restaurant', category: 'Restaurant', country: 'Morocco', coordinate: { latitude: 34.0181, longitude: -5.0078 } },
  { id: 7, name: 'Essaouira Hidden Spot', category: 'Hidden Spot', country: 'Morocco', coordinate: { latitude: 31.5085, longitude: -9.7595 } },
  { id: 8, name: 'Tanger Coffee', category: 'Coffee Shop', country: 'Morocco', coordinate: { latitude: 35.7595, longitude: -5.83395 } },
];

function ExplorerScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Morocco');
  const mapRef = useRef<any>(null);

  // Liste des catégories uniques + All Morocco
  const categories = ['All Morocco', ...Array.from(new Set(markers.map(m => m.category)))];

  // Markers filtrés par pays (Maroc), catégorie et recherche
  const filteredMarkers = markers.filter(m =>
    m.country === 'Morocco' &&
    (selectedCategory === 'All Morocco' || m.category === selectedCategory) &&
    normalize(m.name).includes(normalize(search))
  );

  // Recherche et centrage sur le premier marker trouvé
  const handleSearch = (text: string) => {
    setSearch(text);
    const normalized = normalize(text);
    const found = filteredMarkers.find(m => normalize(m.name).includes(normalized));
    if (found && mapRef.current && (Platform.OS as string) !== 'web') {
      mapRef.current.animateToRegion({
        ...found.coordinate,
        latitudeDelta: 0.04,
        longitudeDelta: 0.02,
      }, 800);
    }
  };

  // Catégories avec icônes
  const categoryIcons: { [key: string]: any } = {
    'All Morocco': 'location',
    'Coffee Shop': 'cafe',
    'Restaurant': 'restaurant',
    'Hidden Spot': 'eye-off',
    'City': 'business',
    'Park': 'leaf',
    'Museum': 'color-palette',
    'Bar': 'beer',
    'Other': 'grid',
  };

  if ((Platform.OS as string) === 'web') {
    return (
      <ImageBackground 
        source={require('../../assets/images/Earth.jpg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 20, 50, 0.85)', 'rgba(0, 30, 70, 0.9)']}
          style={styles.gradient}
        >
          <ScrollView contentContainerStyle={styles.webContainer}>
            <Text style={styles.title}>Explore & Discover</Text>
            <Text style={styles.subtitle}>Discover hidden gems in Morocco</Text>
            
            <View style={styles.searchSection}>
              <SearchBar value={search} onChangeText={handleSearch} />
            </View>

            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.categoriesGrid}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryCard, selectedCategory === cat && styles.categoryCardActive]}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setSearch('');
                    }}
                  >
                    <View style={[styles.categoryIcon, selectedCategory === cat && styles.categoryIconActive]}>
                      <Ionicons 
                        name={categoryIcons[cat] || 'location'} 
                        size={24} 
                        color={selectedCategory === cat ? '#fff' : '#1A1A2E'} 
                      />
                    </View>
                    <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.placesSection}>
              <Text style={styles.sectionTitle}>Places ({filteredMarkers.length})</Text>
              {filteredMarkers.map(marker => (
                <View key={marker.id} style={styles.placeCard}>
                  <View style={styles.placeIconWrapper}>
                    <Ionicons name="location" size={20} color="#1A1A2E" />
                  </View>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{marker.name}</Text>
                    <Text style={styles.placeCategory}>{marker.category}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#888" />
                </View>
              ))}
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    );
  }

  if ((Platform.OS as string) !== 'web') {
    const maps = require('react-native-maps');
    const MapView = maps.default;
    const Marker = maps.Marker;

    return (
      <ImageBackground 
        source={require('../../assets/images/Earth.jpg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.6)', 'rgba(0, 20, 50, 0.8)', 'rgba(0, 30, 70, 0.85)']}
          style={styles.gradient}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Explore & Discover</Text>
              <Text style={styles.subtitle}>Find hidden gems in Morocco</Text>
            </View>

            <View style={styles.searchBarWrapper}>
              <SearchBar value={search} onChangeText={handleSearch} />
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesContent}
            >
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setSearch('');
                  }}
                >
                  <Ionicons 
                    name={categoryIcons[cat] || 'location'} 
                    size={18} 
                    color={selectedCategory === cat ? '#fff' : '#ffffffff'} 
                  />
                  <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: 31.7917,
                  longitude: -7.0926,
                  latitudeDelta: 7,
                  longitudeDelta: 7,
                }}
              >
                {filteredMarkers.map(marker => (
                  <Marker
                    key={marker.id}
                    coordinate={marker.coordinate}
                    title={marker.name}
                    description={marker.category}
                  />
                ))}
              </MapView>
            </View>

            <View style={styles.resultsFooter}>
              <Text style={styles.resultsText}>
                {filteredMarkers.length} place{filteredMarkers.length !== 1 ? 's' : ''} trouvée{filteredMarkers.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    );
  }

  return null;
}

export default ExplorerScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0A1128',
  },
  gradient: {
    flex: 1,
  },
  container: { 
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  searchBarWrapper: {
    paddingHorizontal: 24,
    marginBottom: 16,
    zIndex: 10,
  },
  categoriesScroll: {
    maxHeight: 60,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: '#1A1A2E',
    borderColor: '#1A1A2E',
  },
  categoryChipText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  map: {
    flex: 1,
  },
  resultsFooter: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(36, 107, 253, 0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Styles pour Web
  webContainer: {
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  searchSection: {
    marginBottom: 32,
  },
  categoriesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    width: (width - 72) / 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  categoryCardActive: {
    backgroundColor: '#246BFD',
    borderColor: '#246BFD',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(36, 107, 253, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#fff',
  },
  placesSection: {
    marginBottom: 32,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  placeIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(36, 107, 253, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  placeCategory: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  // Anciens styles (gardés pour compatibilité)
  filterRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterBtn: {
    backgroundColor: '#F2F2F2',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  filterBtnActive: {
    backgroundColor: '#246BFD',
  },
  filterBtnText: {
    color: '#231934',
    fontWeight: '600',
    fontSize: 14,
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  marker: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});