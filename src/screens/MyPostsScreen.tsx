import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Dimensions, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import PlaceCard from '../components/PlaceCard';
import SearchBar from '../components/SearchBar';
import { auth, db } from '../firebase/firebase';
import { Place } from '../navigation/types';
import colors from '../theme/colors';




const MyPostsScreen: React.FC = () => {
  const [posts, setPosts] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMyPosts = async () => {
      const user = auth.currentUser;
      if (!user) {
        setPosts([]);
        setLoading(false);
        console.log('User not authenticated');
        return;
      }
      try {
        const q = query(
          collection(db, 'spots'),
          where('createdBy', '==', user.uid),
          where('isValidated', '==', true)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          console.log('No posts found for user', user.uid);
        }
        const myPosts: Place[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            image: data.image ? { uri: data.image } : require('../../assets/images/profile-avatar.png'),
            rating: data.ratingAvg ?? 0,
            favorite: false,
            latitude: data.latitude ?? 0,
            longitude: data.longitude ?? 0,
            category: data.category || '',
            city: data.city || '',
            openingHours: data.openingHours || '',
            address: data.address || '',
          };
        });
        setPosts(myPosts);
      } catch (e) {
        setPosts([]);
        console.log('Error fetching posts:', e);
      }
      setLoading(false);
    };
    fetchMyPosts();
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
    setEditDesc(post.description);
    setEditModalVisible(true);
  };

  const saveEdit = () => {
    if (!editPost) return;
    setPosts(posts.map(p => p.id === editPost.id ? { ...p, name: editTitle, description: editDesc } : p));
    setEditModalVisible(false);
  };

  if (loading) return <SafeAreaView style={styles.safe}><Text style={styles.loadingText}>Loading...</Text></SafeAreaView>;

  // Filter posts by search only
  const filteredPosts = posts.filter((post) => {
    const searchLower = search.toLowerCase();
    return post.name.toLowerCase().includes(searchLower) || (post.category && post.category.toLowerCase().includes(searchLower));
  });

  let emptyMessage = '';
  if (!auth.currentUser) {
    emptyMessage = 'You must be logged in to see your posts.';
  } else if (!loading && posts.length === 0) {
    emptyMessage = 'No posts found. Try adding a new spot!';
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.hi}>My posts</Text>
        <Text style={styles.subtitle}>Edit your posts</Text>
      </View>
      <View style={styles.container}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onFilterPress={() => {}}
        />
        <SwipeListView
          data={filteredPosts}
          keyExtractor={(item: Place) => item.id}
          renderItem={({ item }: { item: Place }) => (
            <Animated.View style={styles.cardWrapper}>
              <PlaceCard
                image={item.image}
                name={item.name}
                city={item.category}
                rating={item.rating}
                favorite={false}
                onFavoritePress={() => {}}
              />
            </Animated.View>
          )}
          renderHiddenItem={({ item }: { item: Place }) => (
            <View style={styles.rowBack}>
              <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]} onPress={() => openEditModal(item)}>
                <Ionicons name="create-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={24} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          )}
          rightOpenValue={-120}
          disableRightSwipe
          contentContainerStyle={filteredPosts.length === 0 ? { flex: 1, justifyContent: 'center' } : {}}
          ListEmptyComponent={<Text style={styles.emptyText}>{emptyMessage}</Text>}
          style={{ marginTop: 12, marginBottom: 24 }}
        />
      </View>

      {/* Modal d'édition */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit your post</Text>
            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Title"
              placeholderTextColor="#aaa"
              autoFocus
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={editDesc}
              onChangeText={setEditDesc}
              placeholder="Description"
              placeholderTextColor="#aaa"
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Ionicons name="checkmark" size={22} color="#fff" />
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={22} color="#fff" />
                <Text style={styles.cancelBtnText}>Cancel</Text>
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
    marginBottom: 10,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#F7F7FA',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 16,
    marginBottom: 18,
    borderRadius: 20,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'relative',
    top: 0,
    width: 56,
    height: 80,
    marginLeft: 8,
    borderRadius: 16,
  },
  backRightBtnLeft: {
    backgroundColor: '#F4F7FE',
  },
  backRightBtnRight: {
    backgroundColor: '#FDECEC',
  },
  container: { flex: 1, backgroundColor: '#F7F7FA', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 18, color: colors.primary, letterSpacing: 1, alignSelf: 'center', marginTop: 18 },
  // categoryScroll removed
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
  cardCreative: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#F0F0FF',
  },
  postImage: {
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: 16,
    backgroundColor: '#EEE',
  },
  postTitle: { fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 2 },
  postDesc: { fontSize: 15, color: '#555', marginTop: 2, marginBottom: 2 },
  postDate: { fontSize: 13, color: '#aaa', marginTop: 2 },
  actionsCreative: { flexDirection: 'row', marginTop: 10 },
  actionBtnCreative: { marginRight: 16, backgroundColor: '#F4F7FE', borderRadius: 8, padding: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.88,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 18,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#F7F7FA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#aaa',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
});

export default MyPostsScreen;
