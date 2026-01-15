import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from "firebase/auth";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { auth } from "../firebase/firebase";
import colors from "../theme/colors";

const SecurityScreen = () => {
  const navigation = useNavigation<any>();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Erreur", "Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user || !user.email) {
        Alert.alert("Erreur", "Utilisateur non connecté");
        return;
      }

      // Réauthentification
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Changement du mot de passe
      await updatePassword(user, newPassword);

      Alert.alert("Succès", "Mot de passe modifié avec succès", [
        {
          text: "OK",
          onPress: () => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Erreur changement mot de passe:", error);
      let errorMessage = "Impossible de changer le mot de passe";

      if (error.code === "auth/wrong-password") {
        errorMessage = "Le mot de passe actuel est incorrect";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Le nouveau mot de passe est trop faible";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Veuillez vous reconnecter et réessayer";
      }

      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({
    label,
    value,
    onChangeText,
    showPassword,
    toggleShowPassword,
    icon,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    showPassword: boolean;
    toggleShowPassword: () => void;
    icon: string;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={icon as any} size={20} color="#999" />
        <TextInput
          style={styles.input}
          placeholder={label}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={toggleShowPassword}>
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.darkText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sécurité</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Section info */}
        <View style={styles.infoSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
          </View>
          <Text style={styles.infoTitle}>Changement de mot de passe</Text>
          <Text style={styles.infoText}>
            Pour votre sécurité, veuillez entrer votre mot de passe actuel avant d'en
            créer un nouveau.
          </Text>
        </View>

        {/* Formulaire */}
        <View style={styles.formSection}>
          <PasswordInput
            label="Mot de passe actuel"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            showPassword={showCurrentPassword}
            toggleShowPassword={() => setShowCurrentPassword(!showCurrentPassword)}
            icon="lock-closed-outline"
          />

          <PasswordInput
            label="Nouveau mot de passe"
            value={newPassword}
            onChangeText={setNewPassword}
            showPassword={showNewPassword}
            toggleShowPassword={() => setShowNewPassword(!showNewPassword)}
            icon="key-outline"
          />

          <PasswordInput
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            showPassword={showConfirmPassword}
            toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            icon="key-outline"
          />

          {/* Indicateurs de sécurité */}
          <View style={styles.securityIndicators}>
            <Text style={styles.securityTitle}>Exigences du mot de passe:</Text>
            <View style={styles.indicatorRow}>
              <Ionicons
                name={newPassword.length >= 6 ? "checkmark-circle" : "close-circle"}
                size={16}
                color={newPassword.length >= 6 ? "#22C55E" : "#999"}
              />
              <Text
                style={[
                  styles.indicatorText,
                  newPassword.length >= 6 && styles.indicatorValid,
                ]}
              >
                Au moins 6 caractères
              </Text>
            </View>
            <View style={styles.indicatorRow}>
              <Ionicons
                name={
                  newPassword === confirmPassword && newPassword.length > 0
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={16}
                color={
                  newPassword === confirmPassword && newPassword.length > 0
                    ? "#22C55E"
                    : "#999"
                }
              />
              <Text
                style={[
                  styles.indicatorText,
                  newPassword === confirmPassword &&
                    newPassword.length > 0 &&
                    styles.indicatorValid,
                ]}
              >
                Les mots de passe correspondent
              </Text>
            </View>
          </View>
        </View>

        {/* Boutons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>Modifier le mot de passe</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
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
  infoSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.darkText,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  formSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.darkText,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.darkText,
  },
  securityIndicators: {
    marginTop: 12,
    padding: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.darkText,
    marginBottom: 12,
  },
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  indicatorText: {
    fontSize: 14,
    color: "#999",
  },
  indicatorValid: {
    color: "#22C55E",
  },
  buttonSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.darkText,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SecurityScreen;
