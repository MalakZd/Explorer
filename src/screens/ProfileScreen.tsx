import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { logoutUser } from "../firebase/authService";
import { auth, db } from "../firebase/firebase";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();

  const [userData, setUserData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Statistiques dynamiques
  const [postsCount, setPostsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  /* ================= DATA ================= */
  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setUserData(snap.data());
        setProfileImage(snap.data().photoURL || null);
      }

      const dm = await AsyncStorage.getItem("darkMode");
      if (dm) setDarkMode(JSON.parse(dm));
    };
    load();
  }, []);

  // Recharger les données quand l'écran est focusé
  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setUserData(snap.data());
          setProfileImage(snap.data().photoURL || null);
        }

        // Charger les statistiques
        await loadStats(user.uid);
      };
      loadProfile();
    }, [])
  );

  // Charger les statistiques
  const loadStats = async (userId: string) => {
    try {
      // Compter les posts
      const postsQuery = query(
        collection(db, 'spots'),
        where('createdBy', '==', userId)
      );
      const postsSnapshot = await getDocs(postsQuery);
      setPostsCount(postsSnapshot.size);

      // Calculer le rating moyen des posts
      let totalRating = 0;
      let ratedPosts = 0;
      postsSnapshot.docs.forEach(doc => {
        const rating = doc.data().ratingAvg;
        if (rating && rating > 0) {
          totalRating += rating;
          ratedPosts++;
        }
      });
      setAvgRating(ratedPosts > 0 ? totalRating / ratedPosts : 0);

      // Compter les favoris
      const likesQuery = query(
        collection(db, 'likes'),
        where('userId', '==', userId)
      );
      const likesSnapshot = await getDocs(likesQuery);
      setFavoritesCount(likesSnapshot.size);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    AsyncStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  /* ================= IMAGE ================= */
  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à la galerie est nécessaire");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setLoadingImage(true);
      try {
        // Stocker directement l'URI locale (comme pour les spots)
        const photoUri = result.assets[0].uri;
        console.log('Photo sélectionnée:', photoUri);
        
        setProfileImage(photoUri);
        await updateDoc(doc(db, "users", auth.currentUser!.uid), {
          photoURL: photoUri,
        });
        console.log('Photo sauvegardée dans Firestore');
        
        // Recharger immédiatement les données
        const snap = await getDoc(doc(db, "users", auth.currentUser!.uid));
        if (snap.exists()) {
          setProfileImage(snap.data().photoURL || null);
        }
      } catch (error) {
        console.error('Erreur upload photo:', error);
        Alert.alert('Erreur', 'Impossible de sauvegarder la photo');
      } finally {
        setLoadingImage(false);
      }
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    Alert.alert("Déconnexion", "Quitter votre compte ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await logoutUser();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  /* ================= THEME ================= */
  const theme = {
    bg: darkMode ? "#0E0F14" : "#E8ECF4",
    glass: darkMode ? "rgba(30,32,40,0.85)" : "#FFFFFF",
    text: darkMode ? "#FFFFFF" : "#1A1A2E",
    sub: darkMode ? "#A1A7B3" : "#7A7A7A",
    accent: "#246BFD",
    danger: "#FF4B4B",
    cardBg: darkMode ? "rgba(30,32,40,0.6)" : "#FFFFFF",
  };

  /* ================= UI ================= */
  return (
    <ScrollView style={{ backgroundColor: theme.bg, flex: 1 }}>
      {/* ===== HEADER ===== */}
      <ImageBackground
        source={require('../../assets/images/image.png')}
        style={styles.headerBackground}
        // imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.6)", "rgba(26, 26, 46, 0.85)"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
        <TouchableOpacity style={styles.settingsIconBtn} onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.avatarWrapper}>
          <View style={styles.glow} />
          {loadingImage ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require("../../assets/images/profile-avatar.png")
              }
              style={styles.avatar}
            />
          )}
          <TouchableOpacity style={styles.cameraBtn} onPress={pickProfileImage}>
            <Ionicons name="camera" size={18} color="#246BFD" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>
          {userData?.firstName || "Utilisateur"} {userData?.lastName || ""}
        </Text>
        <Text style={styles.username}>
          @{userData?.username || auth.currentUser?.email?.split("@")[0]}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{postsCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{favoritesCount}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{avgRating > 0 ? avgRating.toFixed(1) : '0.0'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </LinearGradient>
      </ImageBackground>

      {/* ===== MENU CARDS ===== */}
      <View style={styles.menuContainer}>
        <View style={[styles.menuCard, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate("MyPosts")}
          >
            <View style={[styles.menuIconWrapper, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="grid" size={22} color="#4CAF50" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuLabel, { color: theme.text }]}>My Posts</Text>
              <Text style={[styles.menuSubtext, { color: theme.sub }]}>View and manage your spots</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.accent} />
          </TouchableOpacity>
        </View>

        <View style={[styles.menuCard, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate("LikedPlaces")}
          >
            <View style={[styles.menuIconWrapper, { backgroundColor: '#FCE4EC' }]}>
              <Ionicons name="heart" size={22} color="#E91E63" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuLabel, { color: theme.text }]}>Favorites</Text>
              <Text style={[styles.menuSubtext, { color: theme.sub }]}>Your saved places</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.accent} />
          </TouchableOpacity>
        </View>

        <View style={[styles.menuCard, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('AccountInfo')}
          >
            <View style={[styles.menuIconWrapper, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="person" size={22} color="#FF9800" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuLabel, { color: theme.text }]}>Account Info</Text>
              <Text style={[styles.menuSubtext, { color: theme.sub }]}>Personal information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.accent} />
          </TouchableOpacity>
        </View>

        <View style={[styles.menuCard, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconWrapper, { backgroundColor: '#E8EAF6' }]}>
              <Ionicons name="help-circle" size={22} color="#3F51B5" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuLabel, { color: theme.text }]}>Help & Support</Text>
              <Text style={[styles.menuSubtext, { color: theme.sub }]}>Get assistance</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== LOGOUT ===== */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <LinearGradient
          colors={['#FF4B4B', '#D32F2F']}
          style={styles.logoutGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* ===== SETTINGS MODAL ===== */}
      <Modal visible={showSettings} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="settings" size={28} color={theme.accent} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>Settings</Text>
            </View>

            <View style={[styles.switchRow, { backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="moon" size={20} color={theme.text} />
                <Text style={[styles.switchLabel, { color: theme.text }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch 
                value={darkMode} 
                onValueChange={setDarkMode}
                trackColor={{ false: "#D1D5DB", true: "#246BFD" }}
                thumbColor={darkMode ? "#fff" : "#f4f3f4"}
              />
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ================= COMPONENT ================= */
const ProfileRow = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <Ionicons name={icon} size={22} color="#246BFD" />
    <Text style={styles.rowText}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
  </TouchableOpacity>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  headerBackground: {
    width: '100%',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  settingsIconBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  glow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  username: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  menuCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  menuIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 13,
  },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF4B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  glassCard: {
    marginTop: -40,
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
  },
  rowText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeBtn: {
    backgroundColor: "#246BFD",
    paddingVertical: 14,
    borderRadius: 12,
  },
  closeText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },
});
