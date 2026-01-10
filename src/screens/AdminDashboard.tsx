import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebase/firebase';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSpots: 0,
    pendingSpots: 0,
    totalComments: 0,
  });
  const [recentSpots, setRecentSpots] = useState<any[]>([]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log(' Loading dashboard data...');
      
      // Charger les statistiques
      const usersSnapshot = await getDocs(collection(db, 'users'));
      console.log(' Users:', usersSnapshot.size);
      
      const spotsSnapshot = await getDocs(collection(db, 'spots'));
      console.log(' Spots:', spotsSnapshot.size);
      
      const commentsSnapshot = await getDocs(collection(db, 'comments'));
      console.log(' Comments:', commentsSnapshot.size);
      
      const pendingQuery = query(
        collection(db, 'spots'),
        where('isValidated', '==', false)
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      console.log('⏳ Pending:', pendingSnapshot.size);

      setStats({
        totalUsers: usersSnapshot.size,
        totalSpots: spotsSnapshot.size,
        pendingSpots: pendingSnapshot.size,
        totalComments: commentsSnapshot.size,
      });

      // Charger les 5 derniers spots
      const recentQuery = query(
        collection(db, 'spots'),
        orderBy('createdAt', 'desc')
      );
      const recentSnapshot = await getDocs(recentQuery);
      const spots = recentSnapshot.docs.slice(0, 5).map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('📈 Recent spots:', spots.length);
      setRecentSpots(spots);
      
      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#246BFD" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#000000ff', '#1A1A2E']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}> Admin Dashboard</Text>
                <Text style={styles.headerSubtitle}>Manage your app</Text>
              </View>
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{stats.pendingSpots}</Text>
                <Text style={styles.headerBadgeLabel}>Pending</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="people" size={32} color="#246BFD" />
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="location" size={32} color="#9C27B0" />
            <Text style={styles.statNumber}>{stats.totalSpots}</Text>
            <Text style={styles.statLabel}>Total Spots</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="time" size={32} color="#FF9800" />
            <Text style={styles.statNumber}>{stats.pendingSpots}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="chatbubbles" size={32} color="#4CAF50" />
            <Text style={styles.statNumber}>{stats.totalComments}</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>
        </View>
      </View>

 
      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Spots</Text>
        
        {recentSpots.map((spot) => (
          <TouchableOpacity key={spot.id} style={styles.activityCard}>
            <Image
              source={{
                uri: spot.images && spot.images.length > 0
                  ? spot.images[0]
                  : 'https://via.placeholder.com/90'
              }}
              style={styles.activityImage}
            />
            <View style={styles.activityInfo}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityName} numberOfLines={1}>
                  {spot.name}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: spot.isValidated ? '#4CAF50' : '#FF9800' },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {spot.isValidated ? '✓ Valid' : '⏳ Pending'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.activityDetails}>
                <View style={styles.activityRow}>
                  <Ionicons name="pricetag" size={14} color="#9C27B0" />
                  <Text style={styles.activityCategory}>{spot.category}</Text>
                </View>
              
              </View>

              <View style={styles.activityFooter}>
                <View style={styles.activityRow}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.activityDate}>{formatDate(spot.createdAt)}</Text>
                </View>
                {spot.ratingAvg > 0 && (
                  <View style={styles.activityRow}>
                    <Ionicons name="star" size={14} color="#FFB300" />
                    <Text style={styles.activityRating}>{spot.ratingAvg.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#246BFD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
  },
  headerBadge: {
    backgroundColor: 'rgba(255,152,0,0.2)',
    borderWidth: 2,
    borderColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  headerBadgeLabel: {
    fontSize: 11,
    color: '#fff',
    marginTop: 2,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A2E',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  activityImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#E8ECF4',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    flex: 1,
    marginRight: 8,
  },
  activityDetails: {
    marginTop: 6,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityCategory: {
    fontSize: 13,
    color: '#9C27B0',
    marginLeft: 6,
    fontWeight: '500',
  },
  activityCity: {
    fontSize: 13,
    color: '#246BFD',
    marginLeft: 6,
    fontWeight: '500',
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  activityRating: {
    fontSize: 13,
    color: '#1A1A2E',
    marginLeft: 4,
    fontWeight: '600',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default AdminDashboard;
