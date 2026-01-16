import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { logoutUser } from "../firebase/authService";
import { auth, db } from "../firebase/firebase";
import colors from "../theme/colors";

const AdminProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        setAdminData(docSnap.data());
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données admin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Recharger les données quand on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      loadAdminData();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", onPress: () => {}, style: "cancel" },
        {
          text: "Déconnecter",
          onPress: async () => {
            try {
              await logoutUser();
            } catch (error) {
              Alert.alert("Erreur", "Impossible de se déconnecter");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const MenuOption = ({
    icon,
    label,
    onPress,
    isDestructive = false,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.menuOption, isDestructive && styles.destructiveOption]}
      onPress={onPress}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={isDestructive ? "#FF4B4B" : colors.primary}
      />
      <Text style={[styles.menuLabel, isDestructive && styles.destructiveLabel]}>
        {label}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={isDestructive ? "#FF4B4B" : "#ccc"}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayName = adminData?.displayName || adminData?.email || "Administrateur";
  const email = adminData?.email || "Non disponible";
  const role = adminData?.role || "admin";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* En-tête avec gradient */}
      <LinearGradient
        colors={[colors.primary, "#1E5FCD"]}
        style={styles.headerGradient}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => navigation.navigate("EditAdminProfile", { adminData })}
            >
              {adminData?.photoURL ? (
                <Image source={{ uri: adminData.photoURL }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={48} color={colors.white} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => navigation.navigate("EditAdminProfile", { adminData })}
            >
              <Ionicons name="pencil" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.white} />
            <Text style={styles.roleText}>{role.toUpperCase()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Informations de compte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations de compte</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={18} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, styles.divider]}>
            <Ionicons name="calendar" size={18} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Créé le</Text>
              <Text style={styles.infoValue}>
                {adminData?.createdAt
                  ? new Date(adminData.createdAt).toLocaleDateString("fr-FR")
                  : "Non disponible"} 
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu des options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Options</Text>
        <View style={styles.menuContainer}>
          <MenuOption
            icon="create"
            label="Modifier le profil"
            onPress={() => navigation.navigate("EditAdminProfile", { adminData })}
          />
          <MenuOption
            icon="shield"
            label="Sécurité"
            onPress={() => navigation.navigate("Security")}
          />
        </View>
      </View>

      {/* Bouton de déconnexion */}
      <View style={styles.section}>
        <MenuOption
          icon="log-out"
          label="Se déconnecter"
          onPress={handleLogout}
          isDestructive={true}
        />
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  headerGradient: {
    paddingTop: 30,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.white,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
    gap: 6,
  },
  roleText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.darkText,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    paddingVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.darkText,
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  destructiveOption: {
    backgroundColor: "#FFF5F5",
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: colors.darkText,
  },
  destructiveLabel: {
    color: "#FF4B4B",
  },
  footer: {
    height: 40,
  },
});

export default AdminProfileScreen;
