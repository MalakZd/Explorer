import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../firebase/firebase';
import type { RootStackParamList } from '../navigation/types';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  bio: string;
}

export default function AccountInfoScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    bio: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          username: data.username || '',
          bio: data.bio || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userData.firstName.trim() || !userData.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, 'users', user.uid), {
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        phone: userData.phone.trim(),
        username: userData.username.trim(),
        bio: userData.bio.trim(),
      });

      Alert.alert('Success', 'Account information updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to update account information');
    } finally {
      setSaving(false);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#1A1A2E', '#001f5dff']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Account Information</Text>
          <Text style={styles.headerSubtitle}>Manage your personal details</Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              loadUserData();
            }
            setIsEditing(!isEditing);
          }}
        >
          <Ionicons 
            name={isEditing ? 'close' : 'create-outline'} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information Section */}
        <Animated.View 
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#246BFD', '#4A90FF']}
              style={styles.sectionIconWrapper}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {isEditing && <View style={styles.editingBadge}>
              <Text style={styles.editingBadgeText}>Editing</Text>
            </View>}
          </View>

          <LinearGradient
            colors={['#ffffff', '#fafbff']}
            style={styles.card}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                 First Name
              </Text>
              <View style={[
                styles.inputWrapper, 
                !isEditing && styles.inputDisabled,
                isEditing && styles.inputEditing
              ]}>
                <View style={styles.inputIconBg}>
                  <Ionicons name="person-outline" size={18} color="#246BFD" />
                </View>
                <TextInput
                  style={styles.input}
                  value={userData.firstName}
                  onChangeText={(text) => setUserData({ ...userData, firstName: text })}
                  placeholder="Enter first name"
                  placeholderTextColor="#999"
                  editable={isEditing}
                />
                {userData.firstName && (
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                 Last Name
              </Text>
              <View style={[
                styles.inputWrapper, 
                !isEditing && styles.inputDisabled,
                isEditing && styles.inputEditing
              ]}>
                <View style={styles.inputIconBg}>
                  <Ionicons name="person-outline" size={18} color="#246BFD" />
                </View>
                <TextInput
                  style={styles.input}
                  value={userData.lastName}
                  onChangeText={(text) => setUserData({ ...userData, lastName: text })}
                  placeholder="Enter last name"
                  placeholderTextColor="#999"
                  editable={isEditing}
                />
                {userData.lastName && (
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                 Username
              </Text>
              <View style={[
                styles.inputWrapper, 
                !isEditing && styles.inputDisabled,
                isEditing && styles.inputEditing
              ]}>
                <View style={styles.inputIconBg}>
                  <Ionicons name="at" size={18} color="#246BFD" />
                </View>
                <TextInput
                  style={styles.input}
                  value={userData.username}
                  onChangeText={(text) => setUserData({ ...userData, username: text })}
                  placeholder="Enter username"
                  placeholderTextColor="#999"
                  editable={isEditing}
                  autoCapitalize="none"
                />
                {userData.username && (
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                )}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Contact Information Section */}
        <Animated.View 
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.sectionIconWrapper}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="mail" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>

          <LinearGradient
            colors={['#ffffff', '#fff5f5']}
            style={styles.card}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                 Email
              </Text>
              <View style={[styles.inputWrapper, styles.inputDisabled, styles.inputLocked]}>
                <View style={styles.inputIconBg}>
                  <Ionicons name="mail-outline" size={18} color="#999" />
                </View>
                <TextInput
                  style={[styles.input, styles.disabledText]}
                  value={userData.email}
                  placeholder="Email address"
                  placeholderTextColor="#999"
                  editable={false}
                />
                <View style={styles.verifiedBadge}>
                  <LinearGradient
                    colors={['#4CAF50', '#66BB6A']}
                    style={styles.verifiedBadgeGradient}
                  >
                    <Ionicons name="checkmark-circle" size={14} color="#fff" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </LinearGradient>
                </View>
              </View>
              <View style={styles.helperTextWrapper}>
                <Ionicons name="lock-closed" size={10} color="#999" />
                <Text style={styles.helperText}> Email cannot be changed</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                 Phone Number
              </Text>
              <View style={[
                styles.inputWrapper, 
                !isEditing && styles.inputDisabled,
                isEditing && styles.inputEditing
              ]}>
                <View style={styles.inputIconBg}>
                  <Ionicons name="call-outline" size={18} color="#246BFD" />
                </View>
                <TextInput
                  style={styles.input}
                  value={userData.phone}
                  onChangeText={(text) => setUserData({ ...userData, phone: text })}
                  placeholder="Enter phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  editable={isEditing}
                />
                {userData.phone && (
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                )}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* About Section */}
        <Animated.View 
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#9C27B0', '#BA68C8']}
              style={styles.sectionIconWrapper}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="information-circle" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <LinearGradient
            colors={['#ffffff', '#f9f5ff']}
            style={styles.card}
          >
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                   Bio
                </Text>
                <View style={[
                  styles.charCountBadge,
                  userData.bio.length > 180 && styles.charCountWarning
                ]}>
                  <Text style={styles.charCountText}>{userData.bio.length}/200</Text>
                </View>
              </View>
              <View style={[
                styles.inputWrapper, 
                styles.textAreaWrapper, 
                !isEditing && styles.inputDisabled,
                isEditing && styles.inputEditing
              ]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={userData.bio}
                  onChangeText={(text) => {
                    if (text.length <= 200) {
                      setUserData({ ...userData, bio: text });
                    }
                  }}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  editable={isEditing}
                  textAlignVertical="top"
                  maxLength={200}
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Save Button */}
        {isEditing && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={saving ? ['#9E9E9E', '#757575'] : ['#246BFD', '#0052D4']}
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c1d6ffff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#E8ECF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 20,
    flexDirection: 'row',
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
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
    flex: 1,
    letterSpacing: 0.3,
  },
  editingBadge: {
    backgroundColor: '#246BFD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editingBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#246BFD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(36, 107, 253, 0.1)',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    height: 56,
    gap: 12,
  },
  inputEditing: {
    backgroundColor: '#fff',
    borderColor: '#246BFD',
    shadowColor: '#246BFD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E8E8E8',
  },
  inputLocked: {
    backgroundColor: '#FFF9E6',
    borderColor: '#FFE082',
  },
  inputIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  disabledText: {
    color: '#757575',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  helperText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  helperTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
  },
  textAreaWrapper: {
    height: 130,
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  textArea: {
    height: 110,
  },
  charCountBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  charCountWarning: {
    backgroundColor: '#FFEBEE',
  },
  charCountText: {
    fontSize: 11,
    color: '#246BFD',
    fontWeight: '700',
  },
  saveButton: {
    borderRadius: 16,
    height: 60,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: '#246BFD',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
