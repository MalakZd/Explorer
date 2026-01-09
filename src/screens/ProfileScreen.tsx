// ProfileScreen: User profile (unprofile)
import { useNavigation } from "@react-navigation/native";
import { logoutUser } from "../firebase/authService";


import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebase/firebase';
import { uploadProfileImage } from '../firebase/storageService';


export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [showDetails, setShowDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Charger les infos utilisateur (nom, username, photo)
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        setUserData(snap.data());
        if (snap.data().photoURL) setProfileImage(snap.data().photoURL);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  // Fonction pour choisir et uploader une image de profil
  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'L\'application a besoin de la permission d\'accéder à vos photos.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLoadingImage(true);
      try {
        const downloadURL = await uploadProfileImage(result.assets[0].uri);
        setProfileImage(downloadURL);
        // Mettre à jour Firestore
        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(db, 'users', user.uid), { photoURL: downloadURL });
        }
        Alert.alert('Succès', 'Photo de profil mise à jour !');
      } catch (e) {
        Alert.alert('Erreur', "Impossible d'uploader la photo");
      } finally {
        setLoadingImage(false);
      }
    }
  };


  const themed = {
    background: darkMode ? '#181A20' : '#F4F7FE',
    card: darkMode ? '#23262F' : '#fff',
    text: darkMode ? '#fff' : '#231934',
    secondary: darkMode ? '#A1A7B3' : '#246BFD',
    border: darkMode ? '#23262F' : '#F2F2F2',
    row: darkMode ? '#23262F' : '#F4F7FE',
    logout: '#FF4B4B',
  };
  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themed.background }]}> 

      <View style={[styles.headerBg, { backgroundColor: themed.secondary }]}> 
        <View style={styles.avatarShadow}>
          <View style={styles.avatarBorder}>
            {loadingImage ? (
              <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }]}> 
                <ActivityIndicator size="large" color={themed.secondary} />
              </View>
            ) : profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <Image source={require('../../assets/images/profile-avatar.png')} style={styles.avatar} />
            )}
            <TouchableOpacity style={styles.editBtn} onPress={pickProfileImage}>
              <Feather name="edit-2" size={18} color={themed.secondary} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.name, { color: themed.text, fontSize: 28, marginTop: 10, marginBottom: 0 }]}> {userData?.firstName || 'Utilisateur'} {userData?.lastName || ''} </Text>
        <Text style={[styles.username, { color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(36,107,253,0.7)', fontSize: 17, marginBottom: 4 }]}>@{userData?.username || auth.currentUser?.email?.split('@')[0]}</Text>
        <Text style={{ color: themed.text, fontSize: 13, marginTop: 2, opacity: 0.7, fontStyle: 'italic' }}></Text>
      </View>
      <View style={[styles.card, { backgroundColor: themed.card, shadowColor: themed.secondary, borderWidth: 1, borderColor: themed.border, marginTop: -48, marginBottom: 32 }]}> 
        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          animationType="slide"
          transparent
          onRequestClose={() => setShowSettings(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity style={styles.settingItem} onPress={() => setDarkMode(d => !d)}>
                <Ionicons name={darkMode ? 'moon' : 'moon-outline'} size={20} color={themed.secondary} />
                <Text style={[styles.settingLabel, { color: themed.text }]}>Dark Mode {darkMode ? '(On)' : '(Off)'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Ionicons name="notifications-outline" size={20} color={themed.secondary} />
                <Text style={[styles.settingLabel, { color: themed.text }]}>Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Ionicons name="lock-closed-outline" size={20} color={themed.secondary} />
                <Text style={[styles.settingLabel, { color: themed.text }]}>Change Password</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Ionicons name="language-outline" size={20} color={themed.secondary} />
                <Text style={[styles.settingLabel, { color: themed.text }]}>Language</Text>
              </TouchableOpacity>
              <Pressable style={styles.closeBtn} onPress={() => setShowSettings(false)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <TouchableOpacity style={[styles.row, { borderBottomColor: themed.border }]} onPress={() => setShowDetails(!showDetails)}>
          <Ionicons name="person-circle-outline" size={24} color={themed.secondary} />
          <Text style={[styles.rowLabel, { color: themed.text }]}>Informations personnelles</Text>
          <Ionicons name={showDetails ? 'chevron-up' : 'chevron-down'} size={22} color={themed.secondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        {showDetails && (
          <View style={[styles.detailsBox, { backgroundColor: themed.row, borderColor: themed.border, borderWidth: 1 }]}> 
            <Text style={styles.detail}><Text style={styles.detailLabel}>Email:</Text> malak@email.com</Text>
            <Text style={styles.detail}><Text style={styles.detailLabel}>Téléphone:</Text> +212 600 000 000</Text>
            <Text style={styles.detail}><Text style={styles.detailLabel}>Ville:</Text> Casablanca, Maroc</Text>
          </View>
        )}
        <TouchableOpacity style={[styles.rowBtn, { backgroundColor: themed.row, borderColor: themed.border, borderWidth: 1 }]} onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-outline" size={22} color={themed.secondary} />
          <Text style={[styles.rowLabel, { color: themed.text }]}>Paramètres</Text>
          <Ionicons name="chevron-forward" size={20} color={themed.secondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        {/* <TouchableOpacity style={[styles.rowBtn, { backgroundColor: themed.row }]} onPress={() => navigation.navigate('Favorites')}> */}
        <TouchableOpacity style={[styles.rowBtn, { backgroundColor: themed.row, borderColor: themed.border, borderWidth: 1 }]} onPress={() => navigation.navigate('LikedPlaces')}>
          <Ionicons name="star-outline" size={22} color={themed.secondary} />
          <Text style={[styles.rowLabel, { color: themed.text }]}>Favoris</Text>
          <Ionicons name="chevron-forward" size={20} color={themed.secondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rowBtn, { backgroundColor: themed.row, borderColor: themed.border, borderWidth: 1 }]}> 
          <Ionicons name="help-circle-outline" size={22} color={themed.secondary} />
          <Text style={[styles.rowLabel, { color: themed.text }]}>Aide & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={themed.secondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: themed.logout, shadowColor: themed.logout, marginTop: 30, marginBottom: 10, borderRadius: 22, paddingVertical: 18, paddingHorizontal: 48 }]} onPress={handleLogout}>
        <Feather name="log-out" size={22} color="#fff" />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F7FE',
    alignItems: 'center',
    paddingBottom: 40,
  },
  headerBg: {
    width: '100%',
    backgroundColor: '#246BFD',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 44,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 28,
    shadowColor: '#246BFD',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarShadow: {
    shadowColor: '#1a2340',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
    borderRadius: 60,
    marginBottom: 10,
  },
  avatarBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  editBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 7,
    shadowColor: '#246BFD',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  username: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 10,
    fontWeight: '500',
  },
  card: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 20,
    marginTop: -38,
    marginBottom: 28,
    shadowColor: '#246BFD',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  rowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    backgroundColor: '#F4F7FE',
    paddingHorizontal: 8,
    shadowColor: '#246BFD',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  rowLabel: {
    fontSize: 17,
    color: '#231934',
    fontWeight: '600',
    marginLeft: 18,
    letterSpacing: 0.2,
  },
  detailsBox: {
    backgroundColor: '#F4F7FE',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  detail: {
    fontSize: 15,
    color: '#231934',
    marginBottom: 4,
  },
  detailLabel: {
    color: '#246BFD',
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4B4B',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginTop: 18,
    alignSelf: 'center',
    shadowColor: '#FF4B4B',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    alignItems: 'flex-start',
    shadowColor: '#246BFD',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#246BFD',
    marginBottom: 18,
    alignSelf: 'center',
    width: '100%',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  settingLabel: {
    fontSize: 16,
    color: '#231934',
    marginLeft: 16,
    fontWeight: '500',
  },
  closeBtn: {
    alignSelf: 'center',
    marginTop: 18,
    backgroundColor: '#246BFD',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
