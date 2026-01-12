import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useTheme } from '../context/ThemeContext';
import { auth, db } from '../firebase/firebase';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import { Place, RootStackParamList } from '../navigation/types';




const MyPostsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const unreadCount = useUnreadNotifications();
  const [posts, setPosts] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'name'>('recent');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'spots'),
      where('createdBy', '==', user.uid),
      where('isValidated', '==', true)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const myPosts: Place[] = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Firestore images field for post', doc.id, data.images);
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          image: data.images && Array.isArray(data.images) && data.images.length > 0
            ? { uri: data.images[0] }
            : undefined,
          rating: data.ratingAvg ?? 0,
          favorite: false,
          latitude: data.latitude ?? 0,
          longitude: data.longitude ?? 0,
          category: data.category || '',
          city: data.city || '',
          openingHours: data.openingHours || '',
          address: data.address || '',
          amenities: data.amenities ?? [],
          priceRange: data.priceRange ?? 'Not specified',
        };
      });
      setPosts(myPosts);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteDoc(doc(db, 'spots', id));
          setPosts(posts.filter((p) => p.id !== id));
        } catch (e: any) {
          console.log('Error deleting post:', e);
          let errorMsg = 'Failed to delete the post.';
          if (e && (e.message || e.code)) {
            errorMsg += `\n${e.message || ''} ${e.code || ''}`;
          }
          Alert.alert('Error', errorMsg);
        }
      }},
    ]);
  };

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editPost, setEditPost] = useState<Place | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');


  const openEditModal = (post: Place) => {
    setEditPost(post);
    setEditTitle(post.name);
    setEditDesc(post.description || '');
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!editPost || !editPost.id) return;
    
    try {
      // Update Firestore
      await updateDoc(doc(db, 'spots', editPost.id), {
        name: editTitle,
        description: editDesc,
      });
      
      // Update local state
      setPosts(posts.map(p => p.id === editPost.id ? { ...p, name: editTitle, description: editDesc } : p));
      setEditModalVisible(false);
      Alert.alert('Success', 'Post updated successfully!');
    } catch (e) {
      console.log('Error updating post:', e);
      Alert.alert('Error', 'Failed to update the post.');
    }
  };

  if (loading) return <SafeAreaView style={styles.safe}><Text style={styles.loadingText}>Loading...</Text></SafeAreaView>;

  // Filter and sort posts
  const filteredPosts = posts
    .filter((post) => {
      const searchLower = search.toLowerCase();
      return post.name.toLowerCase().includes(searchLower) || (post.category && post.category.toLowerCase().includes(searchLower));
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // 'recent' - keep original order
    });

  // Calculate stats
  const totalPosts = posts.length;
  const avgRating = posts.length > 0 
    ? (posts.reduce((sum, p) => sum + (p.rating || 0), 0) / posts.length).toFixed(1)
    : '0.0';
  const topRatedPost = posts.length > 0 
    ? posts.reduce((max, p) => (p.rating || 0) > (max.rating || 0) ? p : max, posts[0])
    : null;

  let emptyMessage = '';
  if (!auth.currentUser) {
    emptyMessage = 'You must be logged in to see your posts.';
  } else if (!loading && posts.length === 0) {
    emptyMessage = 'No posts found. Try adding a new spot!';
  }

  // Header component for list
  const ListHeaderComponent = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.hi, { color: theme.text }]}>My Posts</Text>
          <Text style={[styles.subtitle, { color: theme.sub }]}>Manage your shared places</Text>
        </View>
        <TouchableOpacity 
          style={styles.menuBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.text} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      {posts.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#1A1A2E', '#2A2A3E']}
              style={styles.statGradient}
            >
              <Ionicons name="location" size={24} color="#ffffffff" />
              <Text style={styles.statNumber}>{totalPosts}</Text>
              <Text style={styles.statLabel}>Total Posts</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#246BFD', '#1E5FE0']}
              style={styles.statGradient}
            >
              <Ionicons name="star" size={24} color="#ffffffff" />
              <Text style={styles.statNumber}>{avgRating}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#FF6B9D', '#E85A8D']}
              style={styles.statGradient}
            >
              <Ionicons name="trophy" size={24} color="#ffffffff" />
              <Text style={styles.statNumber}>{topRatedPost ? topRatedPost.rating?.toFixed(1) : '0'}</Text>
              <Text style={styles.statLabel}>Top Rated</Text>
            </LinearGradient>
          </View>
        </View>
      )}

      {/* Search and Controls */}
      <View style={styles.controlsSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(26,26,46,0.4)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search your posts..."
            placeholderTextColor="rgba(26,26,46,0.4)"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="rgba(26,26,46,0.4)" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.sortContainer}>
            <TouchableOpacity 
              style={[styles.sortBtn, sortBy === 'recent' && styles.sortBtnActive]}
              onPress={() => setSortBy('recent')}
            >
              <Text style={[styles.sortText, sortBy === 'recent' && styles.sortTextActive]}>Recent</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sortBtn, sortBy === 'rating' && styles.sortBtnActive]}
              onPress={() => setSortBy('rating')}
            >
              <Text style={[styles.sortText, sortBy === 'rating' && styles.sortTextActive]}>Rating</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sortBtn, sortBy === 'name' && styles.sortBtnActive]}
              onPress={() => setSortBy('name')}
            >
              <Text style={[styles.sortText, sortBy === 'name' && styles.sortTextActive]}>Name</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.viewModeContainer}>
            <TouchableOpacity 
              style={[styles.viewModeBtn, viewMode === 'grid' && styles.viewModeBtnActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons name="grid" size={20} color={viewMode === 'grid' ? '#fff' : '#1A1A2E'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewModeBtn, viewMode === 'list' && styles.viewModeBtnActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list" size={20} color={viewMode === 'list' ? '#fff' : '#1A1A2E'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar style="dark" backgroundColor={theme.bg} />

      {/* Posts List/Grid */}
      {filteredPosts.length === 0 ? (
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          <ListHeaderComponent />
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="location-outline" size={80} color={theme.sub} />
            </View>
            <Text style={styles.emptyTitle}>
              {!auth.currentUser 
                ? 'Please Log In' 
                : posts.length === 0 
                  ? 'No Posts Yet' 
                  : 'No Results Found'}
            </Text>
            <Text style={styles.emptyText}>
              {!auth.currentUser
                ? 'You must be logged in to see your posts.'
                : posts.length === 0
                  ? 'Start sharing amazing places with the community!'
                  : 'Try adjusting your search terms.'}
            </Text>
          </View>
        </ScrollView>
      ) : viewMode === 'grid' ? (
        <FlatList
          ListHeaderComponent={ListHeaderComponent}
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item: post }) => (
            <TouchableOpacity 
              style={styles.gridItem}
              activeOpacity={0.9}
              onLongPress={() => openEditModal(post)}
            >
              <Image 
                source={post.image} 
                style={styles.gridImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(26,26,46,0.9)']}
                style={styles.gridOverlay}
              >
                <View style={styles.gridContent}>
                  <Text style={styles.gridTitle} numberOfLines={1}>{post.name}</Text>
                  <View style={styles.gridFooter}>
                    <View style={styles.gridRating}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.gridRatingText}>{post.rating?.toFixed(1) || '0.0'}</Text>
                    </View>
                    <View style={styles.gridActions}>
                      <TouchableOpacity 
                        style={styles.gridActionBtn}
                        onPress={() => openEditModal(post)}
                      >
                        <Ionicons name="create-outline" size={18} color="#246BFD" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.gridActionBtn}
                        onPress={() => handleDelete(post.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#FF6B9D" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <SwipeListView
          ListHeaderComponent={ListHeaderComponent}
          data={filteredPosts}
          keyExtractor={(item: Place) => item.id}
          renderItem={({ item }: { item: Place }) => (
            <View style={styles.listItem}>
              <Image 
                source={item.image} 
                style={styles.listImage}
              />
              <View style={styles.listContent}>
                <Text style={styles.listTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.listCategory} numberOfLines={1}>{item.category || item.city}</Text>
                <View style={styles.listFooter}>
                  <View style={styles.listRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.listRatingText}>{item.rating?.toFixed(1) || '0.0'}</Text>
                  </View>
                  <View style={styles.listBadge}>
                    <Ionicons name="location" size={12} color="#246BFD" />
                    <Text style={styles.listBadgeText}>{item.city || 'Unknown'}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          renderHiddenItem={({ item }: { item: Place }) => (
            <View style={styles.rowBack}>
              <TouchableOpacity 
                style={[styles.backBtn, styles.backBtnEdit]} 
                onPress={() => openEditModal(item)}
              >
                <Ionicons name="create-outline" size={24} color="#fff" />
                <Text style={styles.backBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.backBtn, styles.backBtnDelete]} 
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={24} color="#fff" />
                <Text style={styles.backBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          rightOpenValue={-160}
          disableRightSwipe
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Post</Text>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#1A1A2E" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Place Name</Text>
              <TextInput
                style={styles.input}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Enter place name"
                placeholderTextColor="rgba(26,26,46,0.4)"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editDesc}
                onChangeText={setEditDesc}
                placeholder="Enter description"
                placeholderTextColor="rgba(26,26,46,0.4)"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveBtn} 
                onPress={saveEdit}
              >
                <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#E8ECF4',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  hi: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(26,26,46,0.6)',
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
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#1A1A2E',
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },

  // Controls Section
  controlsSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  sortBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sortBtnActive: {
    backgroundColor: '#1A1A2E',
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  sortTextActive: {
    color: '#fff',
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  viewModeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  viewModeBtnActive: {
    backgroundColor: '#1A1A2E',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(26,26,46,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: 'rgba(26,26,46,0.5)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Grid View
  gridContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridItem: {
    width: (width - 60) / 2,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
  },
  gridContent: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridRatingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },
  gridActions: {
    flexDirection: 'row',
    gap: 8,
  },
  gridActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List View
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  listCategory: {
    fontSize: 13,
    color: 'rgba(26,26,46,0.5)',
    marginBottom: 8,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listRatingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  listBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8ECF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  listBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#246BFD',
  },

  // Swipe Actions
  rowBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    paddingRight: 24,
    marginBottom: 12,
  },
  backBtn: {
    width: 70,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginLeft: 8,
  },
  backBtnEdit: {
    backgroundColor: '#246BFD',
  },
  backBtnDelete: {
    backgroundColor: '#FF6B9D',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },

  // Edit Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26,26,46,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8ECF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7F7FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: 'rgba(26,26,46,0.1)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#E8ECF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default MyPostsScreen;
