import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../firebase/firebase';

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
  { label: 'Coffee Shop' },
  { label: 'Restaurant' },
  { label: 'Secret Spot' },
  { label: 'Park' },
  { label: 'Museum' },
  { label: 'Bar' },
  { label: 'Other' },
  // { label: 'Hidden Spot' }, (Tanzidha)
  { label: 'Study Spots' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 🔹 STATES
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(0);

  const [spots, setSpots] = useState<Place[]>([]);
  const [favStates, setFavStates] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState<string | null>(null);

  // 🔹 FAVORITE (local pour l’instant)
  const handleFavorite = (idx: number) => {
    setFavStates(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
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
          setFirstName(snap.data().firstName);
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
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const q = query(
          collection(db, 'spots'),
          where('isValidated', '==', true)
        );

        const snapshot = await getDocs(q);

        const spotsData: Place[] = snapshot.docs.map(doc => {
          const data = doc.data();

          return {
            id: doc.id,
            name: data.name,
            city: data.category, // temporaire
            image: { uri: data.image },
            rating: data.ratingAvg ?? 0,
            latitude: data.latitude,
            longitude: data.longitude,
            category: data.category,
            description: data.description,
            favorite: false,
            openingHours: data.openingHours ?? '',
            address: data.address ?? '',
          };
        });

        setSpots(spotsData);
        setFavStates(spotsData.map(() => false));
      } catch (e) {
        console.log('Erreur spots:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, []);

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
        <View style={styles.header}>
          <Text style={styles.hi}>
            Hi{firstName ? `, ${firstName}` : ''}
          </Text>
          <Text style={styles.subtitle}>Explore the world with Spot</Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onFilterPress={() => {}}
          />

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Popular places</Text>
            <TouchableOpacity onPress={() => { setActiveCategory(0); setSearch(''); }}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
            {spots
              .filter((place) => {
                const searchLower = search.toLowerCase();
                const selectedCategory = categories[activeCategory].label;
                // Filtrer par catégorie sélectionnée (sauf Most Viewed)
                const matchCategory =
                  selectedCategory === 'Most Viewed' ||
                  place.category?.toLowerCase() === selectedCategory.toLowerCase();
                // Filtrer par nom ou catégorie (search)
                const matchSearch =
                  place.name.toLowerCase().includes(searchLower) ||
                  place.category.toLowerCase().includes(searchLower);
                return matchCategory && matchSearch;
              })
              .map((place, idx) => (
                <TouchableOpacity
                  key={place.id}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate('PlaceDetails', { place })
                  }
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

