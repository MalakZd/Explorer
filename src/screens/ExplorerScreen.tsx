import { useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SearchBar from '../components/SearchBar';

// Enlève les accents unicode et met en minuscule
function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

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

  if ((Platform.OS as string) === 'web') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styles.searchBarWrapper}>
          <SearchBar value={search} onChangeText={handleSearch} />
          <View style={styles.filterRow}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterBtn, selectedCategory === cat && styles.filterBtnActive]}
                onPress={() => {
                  setSelectedCategory(cat);
                  setSearch(''); // reset search on filter change
                }}
              >
                <Text style={[styles.filterBtnText, selectedCategory === cat && styles.filterBtnTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Text>La carte n'est pas disponible sur le web.</Text>
      </View>
    );
  }

  if ((Platform.OS as string) !== 'web') {
    const maps = require('react-native-maps');
    const MapView = maps.default;
    const Marker = maps.Marker;

    return (
      <View style={styles.container}>
        <View style={styles.searchBarWrapper}>
          <SearchBar value={search} onChangeText={handleSearch} />
        </View>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: 31.7917, // centre du Maroc
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
    );
  }

  return null;
}

export default ExplorerScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBarWrapper: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 10,
  },
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