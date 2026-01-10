import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebase/firebase';

const AdminScreen = () => {
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterRole, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => (user.role || 'user') === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (uid: string, name: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', uid));
              Alert.alert('Succès', 'Utilisateur supprimé avec succès');
              fetchUsers();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'utilisateur');
            }
          }
        }
      ]
    );
  };

  const handleToggleRole = async (uid: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: newRole,
      });
      Alert.alert('Succès', `Rôle modifié en ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      Alert.alert('Erreur', 'Impossible de modifier le rôle');
    }
  };

  const handleViewUserPosts = async (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setLoadingPosts(true);
    try {
      const postsQuery = query(
        collection(db, 'spots'),
        where('createdBy', '==', user.uid)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const posts = postsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          city: data.city || '',
          category: data.category || '',
          image: data.images && Array.isArray(data.images) && data.images.length > 0
            ? { uri: data.images[0] }
            : undefined,
          rating: data.ratingAvg || 0,
          isValidated: data.isValidated || false,
          description: data.description || '',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          openingHours: data.openingHours || '',
          address: data.address || '',
          amenities: data.amenities || [],
          priceRange: data.priceRange || 'Not specified',
        };
      });
      setUserPosts(posts);
    } catch (error) {
      console.error('Error loading user posts:', error);
      Alert.alert('Erreur', 'Impossible de charger les posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleDeletePost = async (postId: string, postName: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer "${postName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'spots', postId));
              Alert.alert('Succès', 'Post supprimé avec succès');
              // Recharger les posts de l'utilisateur
              if (selectedUser) {
                handleViewUserPosts(selectedUser);
              }
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le post');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={
            item.photoURL
              ? { uri: item.photoURL }
              : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.firstName || '')}+${encodeURIComponent(item.lastName || '')}&background=1A1A2E&color=fff&size=128` }
          }
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
            <View style={[styles.roleBadge, item.role === 'admin' ? styles.adminBadge : styles.userBadge]}>
              <Ionicons 
                name={item.role === 'admin' ? 'shield-checkmark' : 'person'} 
                size={12} 
                color="#fff" 
              />
              <Text style={styles.roleText}>{item.role || 'user'}</Text>
            </View>
          </View>
          <Text style={styles.email}>{item.email}</Text>
          {item.username && (
            <Text style={styles.username}>@{item.username}</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.viewBtn]} 
          onPress={() => handleViewUserPosts(item)}
        >
          <Ionicons name="albums" size={18} color="#fff" />
          <Text style={styles.actionText}>Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, styles.roleBtn]} 
          onPress={() => handleToggleRole(item.uid, item.role || 'user')}
        >
          <Ionicons 
            name={item.role === 'admin' ? 'person' : 'shield-checkmark'} 
            size={18} 
            color="#fff" 
          />
          <Text style={styles.actionText}>
            {item.role === 'admin' ? 'User' : 'Admin'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]} 
          onPress={() => handleDelete(item.uid, `${item.firstName} ${item.lastName}`)}
        >
          <Ionicons name="trash" size={18} color="#fff" />
          <Text style={styles.actionText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1A1A2E', '#002162ff']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}> Gestion Utilisateurs</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{users.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {users.filter(u => u.role === 'admin').length}
                </Text>
                <Text style={styles.statLabel}>Admins</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterBtn, filterRole === 'all' && styles.filterBtnActive]}
            onPress={() => setFilterRole('all')}
          >
            <Text style={[styles.filterText, filterRole === 'all' && styles.filterTextActive]}>
              Tous
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filterRole === 'admin' && styles.filterBtnActive]}
            onPress={() => setFilterRole('admin')}
          >
            <Text style={[styles.filterText, filterRole === 'admin' && styles.filterTextActive]}>
              Admins
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filterRole === 'user' && styles.filterBtnActive]}
            onPress={() => setFilterRole('user')}
          >
            <Text style={[styles.filterText, filterRole === 'user' && styles.filterTextActive]}>
              Users
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Users List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#246BFD" />
          <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.uid}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* User Posts Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1A1A2E', '#002162ff']}
            style={styles.modalHeader}
          >
            <SafeAreaView edges={['top']}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  onPress={() => setShowUserModal(false)}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.modalUserInfo}>
                  <Image
                    source={
                      selectedUser?.photoURL
                        ? { uri: selectedUser.photoURL }
                        : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.firstName || '')}+${encodeURIComponent(selectedUser?.lastName || '')}&background=1A1A2E&color=fff&size=128` }
                    }
                    style={styles.modalAvatar}
                  />
                  <View style={styles.modalUserText}>
                    <Text style={styles.modalUserName}>
                      {selectedUser?.firstName} {selectedUser?.lastName}
                    </Text>
                    <Text style={styles.modalUserEmail}>@{selectedUser?.username || selectedUser?.email}</Text>
                  </View>
                </View>
                <View style={styles.modalStats}>
                  <Text style={styles.modalStatsNumber}>{userPosts.length}</Text>
                  <Text style={styles.modalStatsLabel}>Posts</Text>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>

          {loadingPosts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#246BFD" />
              <Text style={styles.loadingText}>Chargement des posts...</Text>
            </View>
          ) : userPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucun post trouvé</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalContent}
            >
              <View style={styles.postsGrid}>
                {userPosts.map((post) => (
                  <View key={post.id} style={styles.postCard}>
                    <TouchableOpacity
                      style={styles.postCardTouchable}
                      onPress={() => {
                        setShowUserModal(false);
                        const parent = navigation.getParent();
                        if (parent) {
                          parent.navigate('PlaceDetails', { place: post });
                        }
                      }}
                    >
                      <ImageBackground
                        source={post.image || require('../../assets/images/place1.jpg')}
                        style={styles.postCardImage}
                        imageStyle={styles.postCardImageStyle}
                      >
                        <LinearGradient
                          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                          style={styles.postCardGradient}
                        >
                          {!post.isValidated && (
                            <View style={styles.pendingBadge}>
                              <Text style={styles.pendingText}>En attente</Text>
                            </View>
                          )}
                          <View style={styles.postCardInfo}>
                          <Text style={styles.postCardName} numberOfLines={2}>
                            {post.name}
                          </Text>
                          <View style={styles.postCardBottom}>
                            <View style={styles.postCardCategory}>
                              <Ionicons name="pricetag" size={12} color="#fff" />
                              <Text style={styles.postCardCategoryText}>{post.category}</Text>
                            </View>
                            {post.rating > 0 && (
                              <View style={styles.postCardRating}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={styles.postCardRatingText}>{post.rating.toFixed(1)}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deletePostBtn}
                      onPress={() => handleDeletePost(post.id, post.name)}
                    >
                      <Ionicons name="trash" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  header: {
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 28,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1A1A2E',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterBtnActive: {
    backgroundColor: '#246BFD',
    borderColor: '#246BFD',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: '#E8ECF4',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    flex: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  adminBadge: {
    backgroundColor: '#246BFD',
  },
  userBadge: {
    backgroundColor: '#666',
  },
  roleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  username: {
    fontSize: 13,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  viewBtn: {
    backgroundColor: '#9C27B0',
  },
  roleBtn: {
    backgroundColor: '#246BFD',
  },
  deleteBtn: {
    backgroundColor: '#FF4B4B',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    paddingBottom: 20,
  },
  modalHeaderContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  modalUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  modalUserText: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  modalStats: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  modalStatsNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  modalStatsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    padding: 16,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  postCard: {
    width: (Dimensions.get('window').width - 48) / 2,
    height: 220,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  postCardTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  postCardImage: {
    width: '100%',
    height: '100%',
  },
  postCardImageStyle: {
    borderRadius: 16,
  },
  postCardGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  pendingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  postCardInfo: {
    gap: 8,
  },
  postCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  postCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postCardCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postCardCategoryText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  postCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postCardRatingText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  deletePostBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#FF4B4B',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
});

export default AdminScreen;
