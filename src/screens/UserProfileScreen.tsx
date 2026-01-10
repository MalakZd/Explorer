import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../firebase/firebase';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';
import type { Place, RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'UserProfile'>;

type UserProfileNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'UserProfile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const { width } = Dimensions.get('window');

const categories = [
  { label: 'All', icon: 'apps' },
  { label: 'Coffee Shop', icon: 'cafe' },
  { label: 'Restaurant', icon: 'restaurant' },
  { label: 'Secret Spot', icon: 'eye-off' },
  { label: 'Park', icon: 'leaf' },
  { label: 'Museum', icon: 'color-palette' },
  { label: 'Bar', icon: 'beer' },
  { label: 'Study Spots', icon: 'book' },
];

export default function UserProfileScreen({ route }: Props) {
  const navigation = useNavigation<UserProfileNavigationProp>();
  const { userId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<Place[]>([]);
  const [stats, setStats] = useState({ posts: 0, avgRating: 0 });
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      // Load user data
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }

      // Load user's posts
      const postsQuery = query(
        collection(db, 'spots'),
        where('createdBy', '==', userId),
        where('isValidated', '==', true)
      );
      const postsSnapshot = await getDocs(postsQuery);
      
      const posts: Place[] = [];
      let totalRating = 0;
      let ratedCount = 0;

      postsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          name: data.name,
          city: data.city || '',
          rating: data.ratingAvg || 0,
          image: data.images && Array.isArray(data.images) && data.images.length > 0
            ? { uri: data.images[0] }
            : undefined,
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          category: data.category || '',
          description: data.description || '',
          openingHours: data.openingHours || '',
          address: data.address || '',
          amenities: data.amenities || [],
          priceRange: data.priceRange || 'Not specified',
          favorite: false,
        });

        if (data.ratingAvg && data.ratingAvg > 0) {
          totalRating += data.ratingAvg;
          ratedCount++;
        }
      });

      setUserPosts(posts);
      setStats({
        posts: posts.length,
        avgRating: ratedCount > 0 ? totalRating / ratedCount : 0,
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter posts by category
  const filteredPosts = activeCategory === 0 
    ? userPosts 
    : userPosts.filter(post => post.category === categories[activeCategory].label);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#246BFD" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={require('../../assets/images/image.png')}
        style={styles.headerBackground}
        imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.6)', 'rgba(26, 26, 46, 0.85)']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
          <Image
            source={
              userData?.photoURL
                ? { uri: userData.photoURL }
                : require('../../assets/images/profile-avatar.png')
            }
            style={styles.avatar}
          />
          <Text style={styles.userName}>
            {userData?.firstName || ''} {userData?.lastName || ''}
          </Text>
          {userData?.username && (
            <Text style={styles.username}>@{userData.username}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '0.0'}
              </Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      </ImageBackground>

      {/* Posts Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setActiveCategory(idx)}
              style={[
                styles.categoryPill,
                activeCategory === idx && styles.categoryPillActive,
              ]}
            >
              <Ionicons
                name={cat.icon as any}
                size={18}
                color={activeCategory === idx ? '#fff' : '#1A1A2E'}
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === idx && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          {activeCategory === 0 ? 'All Posts' : categories[activeCategory].label} ({filteredPosts.length})
        </Text>

        {filteredPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeCategory === 0 ? 'No posts yet' : `No ${categories[activeCategory].label} posts`}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.gridItem}
                onPress={() => {
                  const parent = navigation.getParent();
                  if (parent) {
                    parent.navigate('PlaceDetails', { place: post });
                  }
                }}
              >
                <ImageBackground
                  source={post.image || require('../../assets/images/place1.jpg')}
                  style={styles.gridImage}
                  imageStyle={styles.gridImageStyle}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gridGradient}
                  >
                    <Text style={styles.gridName} numberOfLines={1}>
                      {post.name}
                    </Text>
                    {post.rating > 0 && (
                      <View style={styles.gridRating}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.gridRatingText}>
                          {post.rating.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8ECF4',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#E8ECF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackground: {
    width: '100%',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#246BFD',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  username: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  categoriesContainer: {
    marginBottom: 20,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryPillActive: {
    backgroundColor: '#1A1A2E',
    borderColor: '#1A1A2E',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  categoryTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: (width - 52) / 2,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridImageStyle: {
    borderRadius: 16,
  },
  gridGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  gridName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  gridRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  gridRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
