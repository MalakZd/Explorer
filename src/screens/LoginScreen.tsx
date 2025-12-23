
import { loginUser } from "../firebase/authService";

import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { RootStackParamList } from '../navigation/types';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [error, setError] = useState<string | null>(null);
  const handleLogin = async () => {
    setError(null);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      await loginUser(email, password);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err);
    }
  };




  if (showSuccess) {
    
    // Affiche l'écran de succès après login
    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Image source={require('../../assets/images/success.png')} style={{ width: 220, height: 220 }} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Yey! Login Successfull</Text>
        <Text style={styles.subtitle}>You will be moved to home screen right now.{"\n"}Enjoy the features!</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Main')}>
          <Text style={styles.buttonText}>Lets Explore</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Let's login for explore continues</Text>
      <Image source={require('../../assets/images/logoblack.jpg')} style={styles.logoImg} resizeMode="contain" />
      <Text style={styles.label}>Email or Phone Number</Text>
      <View style={styles.inputWrapperRow}>
        <Feather name="mail" size={20} color="#246BFD" style={styles.inputIcon} />
        <TextInput
          style={styles.inputWithIconRow}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#888"
        />
      </View>
      <Text style={styles.label}>Password</Text>
      <View style={styles.inputWrapperRow}>
        <Feather name="lock" size={20} color="#246BFD" style={styles.inputIcon} />
        <TextInput
          style={styles.inputWithIconRow}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#888"
        />
        <Ionicons name="eye-off-outline" size={20} color="#246BFD" style={styles.inputIconRight} />
      </View>
      <View style={styles.row}>
        <Switch value={remember} onValueChange={setRemember} />
        <Text style={styles.remember}>Remember me</Text>
        <TouchableOpacity style={{ marginLeft: 'auto' }}>
          <Text style={styles.forgot}>Forgot password</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>
      <Text style={styles.signup}>
        Don't have an account?{' '}
        <Text style={styles.signupLink} onPress={() => navigation.navigate('Register')}>Sign Up here</Text>
      </Text>
    </View>
  );
}



const styles = StyleSheet.create({
  errorText: {
    color: "#FF4B4B",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 14,
  },
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 24 },
  logoImg: { width: 180, height: 60, alignSelf: 'center', marginBottom: 32 },
  label: { fontWeight: '600', fontSize: 15, marginBottom: 6 },
  inputWrapper: { backgroundColor: '#F2F2F2', borderRadius: 12, marginBottom: 16, paddingHorizontal: 12 },
  inputIcon: { position: 'absolute', left: 18, top: '50%', marginTop: -10, zIndex: 2 },
  inputIconRight: { position: 'absolute', right: 18, top: '50%', marginTop: -10, zIndex: 2 },
  inputWithIconRow: { flex: 1, height: 48, fontSize: 16, paddingLeft: 36, paddingRight: 36, marginTop: 0, marginBottom: 0, textAlignVertical: 'center' },
  inputWrapperRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F2', borderRadius: 12, marginBottom: 16, paddingHorizontal: 12, height: 48 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  remember: { marginLeft: 8, color: '#231934' },
  forgot: { color: '#246BFD', fontWeight: '600' },
  button: { backgroundColor: '#246BFD', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  signup: { textAlign: 'center', color: '#888' },
  signupLink: { color: '#246BFD', fontWeight: '600' },
});