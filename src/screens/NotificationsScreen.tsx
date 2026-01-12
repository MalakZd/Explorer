import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { auth, db } from '../firebase/firebase';
import { RootStackParamList } from '../navigation/types';

interface Notification {
  id: string;
  type: 'like' | 'comment';
  postId: string;
  postName: string;
  userName: string;
  message: string;
  timestamp: any;
  read: boolean;
}

export default function NotificationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'read' | 'unread'>('newest');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Notification, 'id'>
      }));
      
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sort notifications based on selected option
  const sortedNotifications = [...notifications].sort((a, b) => {
    const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
    const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;

    switch (sortOption) {
      case 'newest':
        return timeB - timeA; // descending
      case 'oldest':
        return timeA - timeB; // ascending
      case 'read':
        return a.read === b.read ? timeB - timeA : a.read ? -1 : 1;
      case 'unread':
        return a.read === b.read ? timeB - timeA : a.read ? 1 : -1;
      default:
        return timeB - timeA;
    }
  });

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return '';
    const now = new Date().getTime();
    const notifTime = timestamp.toDate ? timestamp.toDate().getTime() : timestamp;
    const diffInMinutes = Math.floor((now - notifTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} Minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} Hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} Days ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      default:
        return 'notifications';
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, { backgroundColor: theme.cardBg }, !item.read && styles.unreadCard]}
      onPress={() => {
        markAsRead(item.id);
        // Navigate to post details if needed
      }}
    >
      <View style={styles.notificationLeft}>
        <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
          <Ionicons name={getIcon(item.type)} size={24} color="#246BFD" />
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, { color: theme.text }]}>{item.type === 'like' ? 'New Like' : 'New Comment'}</Text>
        <Text style={[styles.notificationMessage, { color: theme.sub }]} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={[styles.notificationTime, { color: theme.sub }]}>{getTimeAgo(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.sectionHeader, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Latest notification</Text>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Text style={[styles.sortText, { color: theme.sub }]}>Sort By</Text>
          <Ionicons name="chevron-down" size={16} color={theme.sub} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={theme.sub} />
          <Text style={[styles.emptyText, { color: theme.text }]}>No notifications yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.sub }]}>You'll be notified when someone interacts with your posts</Text>
        </View>
      ) : (
        <FlatList
          data={sortedNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.sortModal, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.sortModalTitle, { color: theme.text }]}>Sort By</Text>
            
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortOption('newest');
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, { color: theme.text }]}>Newest First</Text>
              <View style={[styles.radioOuter, sortOption === 'newest' && styles.radioSelected]}>
                {sortOption === 'newest' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortOption('oldest');
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, { color: theme.text }]}>Older First</Text>
              <View style={[styles.radioOuter, sortOption === 'oldest' && styles.radioSelected]}>
                {sortOption === 'oldest' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortOption('read');
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, { color: theme.text }]}>Read Notification</Text>
              <View style={[styles.radioOuter, sortOption === 'read' && styles.radioSelected]}>
                {sortOption === 'read' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortOption('unread');
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, { color: theme.text }]}>Unread Notification</Text>
              <View style={[styles.radioOuter, sortOption === 'unread' && styles.radioSelected]}>
                {sortOption === 'unread' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
    paddingTop: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 3,
    borderLeftColor: '#06132dff',
  },
  notificationLeft: {
    position: 'relative',
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  sortModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 20,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#246BFD',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#246BFD',
  },
});
