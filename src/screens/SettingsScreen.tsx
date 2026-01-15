import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { auth, db } from "../firebase/firebase";
import colors from "../theme/colors";

const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  
  // États pour les préférences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newPlaceAlerts, setNewPlaceAlerts] = useState(true);
  const [reportAlerts, setReportAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const saveSettings = async (key: string, value: boolean) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        [`settings.${key}`]: value,
      });
    } catch (error) {
      console.error("Erreur sauvegarde paramètres:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder les paramètres");
    }
  };

  const SettingRow = ({
    icon,
    title,
    description,
    value,
    onValueChange,
  }: {
    icon: string;
    title: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          onValueChange(val);
          saveSettings(title.toLowerCase().replace(/\s/g, "_"), val);
        }}
        trackColor={{ false: "#E5E5E5", true: `${colors.primary}50` }}
        thumbColor={value ? colors.primary : "#f4f3f4"}
      />
    </View>
  );

  const MenuButton = ({
    icon,
    title,
    subtitle,
    onPress,
    danger = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.menuButton, danger && styles.dangerButton]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <View
          style={[
            styles.iconContainer,
            danger && { backgroundColor: "#FFF5F5" },
          ]}
        >
          <Ionicons
            name={icon as any}
            size={20}
            color={danger ? "#FF4B4B" : colors.primary}
          />
        </View>
        <View>
          <Text style={[styles.menuTitle, danger && { color: "#FF4B4B" }]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={danger ? "#FF4B4B" : "#ccc"}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <SettingRow
              icon="mail"
              title="Notifications email"
              description="Recevoir des emails pour les événements importants"
              value={emailNotifications}
              onValueChange={setEmailNotifications}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="notifications"
              title="Notifications push"
              description="Recevoir des notifications sur l'appareil"
              value={pushNotifications}
              onValueChange={setPushNotifications}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="location"
              title="Alertes nouveaux lieux"
              description="Être notifié des nouveaux lieux ajoutés"
              value={newPlaceAlerts}
              onValueChange={setNewPlaceAlerts}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="alert-circle"
              title="Alertes signalements"
              description="Être notifié des nouveaux signalements"
              value={reportAlerts}
              onValueChange={setReportAlerts}
            />
          </View>
        </View>

        {/* Apparence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apparence</Text>
          <View style={styles.card}>
            <SettingRow
              icon="moon"
              title="Mode sombre"
              description="Activer le thème sombre"
              value={darkMode}
              onValueChange={(val) => {
                setDarkMode(val);
                Alert.alert("Info", "Le mode sombre sera disponible prochainement");
              }}
            />
          </View>
        </View>

        {/* Compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <View style={styles.card}>
            <MenuButton
              icon="person"
              title="Informations du compte"
              subtitle="Modifier vos informations personnelles"
              onPress={() => {
                Alert.alert("Info", "Accédez à la modification via le profil");
              }}
            />
            <View style={styles.divider} />
            <MenuButton
              icon="shield"
              title="Confidentialité"
              subtitle="Gérer vos données personnelles"
              onPress={() => {
                Alert.alert(
                  "Confidentialité",
                  "Vos données sont protégées selon notre politique de confidentialité"
                );
              }}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <MenuButton
              icon="help-circle"
              title="Centre d'aide"
              subtitle="FAQ et guides d'utilisation"
              onPress={() => {
                Alert.alert(
                  "Centre d'aide",
                  "Consultez notre documentation en ligne pour toute assistance"
                );
              }}
            />
            <View style={styles.divider} />
            <MenuButton
              icon="mail"
              title="Contacter le support"
              subtitle="Envoyez-nous un message"
              onPress={() => {
                Alert.alert(
                  "Support",
                  "Email: support@explorer.com\nNous répondons sous 24h"
                );
              }}
            />
            <View style={styles.divider} />
            <MenuButton
              icon="document-text"
              title="Conditions d'utilisation"
              onPress={() => {
                Alert.alert(
                  "Conditions d'utilisation",
                  "Consultez nos conditions sur notre site web"
                );
              }}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone de danger</Text>
          <View style={styles.card}>
            <MenuButton
              icon="trash"
              title="Supprimer le compte"
              subtitle="Cette action est irréversible"
              danger
              onPress={() => {
                Alert.alert(
                  "Supprimer le compte",
                  "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
                  [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Supprimer",
                      style: "destructive",
                      onPress: () => {
                        Alert.alert(
                          "Confirmation requise",
                          "Pour supprimer votre compte, veuillez contacter le support"
                        );
                      },
                    },
                  ]
                );
              }}
            />
          </View>
        </View>

        {/* Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2026 Explorer. Tous droits réservés.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkText,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.darkText,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.darkText,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: "#999",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 68,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dangerButton: {
    backgroundColor: "#FFF5F5",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.darkText,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  versionSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  versionText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: "#ccc",
  },
});

export default SettingsScreen;
