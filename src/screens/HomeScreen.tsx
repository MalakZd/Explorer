import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryPill from '../components/CategoryPill';
import PlaceCard from '../components/PlaceCard';
import SearchBar from '../components/SearchBar';
import { Place, RootStackParamList } from '../navigation/types';
import colors from '../theme/colors';

export const options = {
  headerShown: false,
};

const categories = [
  { label: 'Most Viewed' },
  { label: 'Coffee shops' },
  { label: 'Restaurants' },
];

const places: Place[] = [
  {
    image: require('../../assets/images/place1.jpg'),
    name: 'Dar El Yacout, Marrakech',
    city: 'Marrakech, Morocco',
    rating: 4.8,
    favorite: true,
  },
  {
    image: require('../../assets/images/place2.jpg'),
    name: 'Café de Paris',
    city: 'Paris, France',
    rating: 4.7,
    favorite: false,
  },
  {
    image: require('../../assets/images/place3.jpg'),
    name: 'La Piazza',
    city: 'Rome, Italy',
    rating: 4.6,
    favorite: false,
  },
];

const HomeScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(0);
  const [favStates, setFavStates] = useState(places.map(p => p.favorite));
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleFavorite = (idx: number) => {
    setFavStates(favStates => {
      const newFavs = [...favStates];
      newFavs[idx] = !newFavs[idx];
      return newFavs;
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.hi}>Hi, User</Text>
          <Text style={styles.subtitle}>Explore the world with SpotNa</Text>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <SearchBar value={search} onChangeText={setSearch} onFilterPress={() => {}} />
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Popular places</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat, idx) => (
              <CategoryPill
                key={cat.label}
                label={cat.label}
                active={activeCategory === idx}
                onPress={() => setActiveCategory(idx)}
              />
            ))}
          </ScrollView>
          <View style={styles.cardsScroll}>
            {places.map((place, idx) => (
              <TouchableOpacity
                key={place.name}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('PlaceDetails', { place })}
                style={styles.cardWrapper}
              >
                <PlaceCard
                  image={place.image}
                  name={place.name}
                  city={place.city}
                  rating={place.rating}
                  favorite={favStates[idx]}
                  onFavoritePress={() => handleFavorite(idx)}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 12,
    backgroundColor: colors.white,
  },
  hi: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 17,
    color: colors.darkText,
    opacity: 0.7,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkText,
  },
  viewAll: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  categoryScroll: {
    marginVertical: 8,
  },
  cardsScroll: {
    marginTop: 12,
    marginBottom: 24,
    flexDirection: 'column',
    gap: 18,
  },
  cardWrapper: {
    width: '100%',
    alignSelf: 'center',
    marginBottom: 18,
  },

});

export default HomeScreen;

