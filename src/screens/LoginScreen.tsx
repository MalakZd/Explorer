import { loginUser } from "../firebase/authService";

import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
    Image,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import type { RootStackParamList } from "../navigation/types";

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      await loginUser(email, password);
      setShowPassword(false);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    }
  };

  // Écran succès
  if (showSuccess) {
    return (
      <View style={styles.container}>
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Image
            source={require("../../assets/images/success.png")}
            style={{ width: 220, height: 220 }}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Yey! Login Successful</Text>
        <Text style={styles.subtitle}>
          You will be moved to home screen right now.{"\n"}Enjoy the features!
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Main")}
        >
          <Text style={styles.buttonText}>Let’s Explore</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Let's login for explore continues</Text>

      <Image
        source={require("../../assets/images/logoblack.jpg")}
        style={styles.logoImg}
        resizeMode="contain"
      />

      {/* EMAIL */}
      <Text style={styles.label}>Email</Text>
      <View style={styles.inputWrapperRow}>
        <Feather name="mail" size={20} color="#1A1A2E" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#888"
        />
      </View>

      {/* PASSWORD */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.inputWrapperRow}>
        <Feather name="lock" size={20} color="#1A1A2E" style={styles.inputIcon} />

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#888"
        />

        <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#1A1A2E"
          />
        </TouchableOpacity>
      </View>

      {/* REMEMBER + FORGOT */}
      <View style={styles.row}>
        <Switch value={remember} onValueChange={setRemember} />
        <Text style={styles.remember}>Remember me</Text>

        <TouchableOpacity style={{ marginLeft: "auto" }}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      {/* ERROR */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      {/* SIGN UP */}
      <Text style={styles.signup}>
        Don't have an account?{" "}
        <Text
          style={styles.signupLink}
          onPress={() => navigation.navigate("Register")}
        >
          Sign Up here
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
  },

  logoImg: {
    width: 180,
    height: 60,
    alignSelf: "center",
    marginBottom: 32,
  },

  label: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 6,
  },

  inputWrapperRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },

  inputIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  remember: {
    marginLeft: 8,
    color: "#231934",
  },

  forgot: {
    color: "#1A1A2E",
    fontWeight: "600",
  },

  errorText: {
    color: "#FF4B4B",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 14,
  },

  button: {
    backgroundColor: "#1A1A2E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  signup: {
    textAlign: "center",
    color: "#888",
  },

  signupLink: {
    color: "#1A1A2E",
    fontWeight: "600",
  },
});
