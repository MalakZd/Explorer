
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';

export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Create account for exploring news</Text>
      {step === 1 && (
        <>
          <Image source={require('../../assets/images/login-amico.png')} style={styles.amicoImgLarge} resizeMode="contain" />
          <Text style={styles.label}>Email or Phone Number</Text>
          <View style={styles.inputWrapperRow}>
            <Feather name="mail" size={20} color="#246BFD" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIconRow}
              placeholder="Email or Phone Number"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </>
      )}
      {step === 2 && (
        <>
          <Image source={require('../../assets/images/account-created.png')} style={styles.amicoImgLarge} resizeMode="contain" />
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputWrapperRow}>
            <Feather name="user" size={20} color="#246BFD" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIconRow}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholderTextColor="#888"
            />
          </View>
          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputWrapperRow}>
            <Feather name="user" size={20} color="#246BFD" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIconRow}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
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
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapperRow}>
            <Feather name="lock" size={20} color="#246BFD" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIconRow}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#888"
            />
            <Ionicons name="eye-off-outline" size={20} color="#246BFD" style={styles.inputIconRight} />
          </View>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AccountCreated')}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 24 },
  logoImg: { width: 180, height: 60, alignSelf: 'center', marginBottom: 32 },
  logoText: { fontFamily: 'serif', fontSize: 38, fontWeight: 'bold', textAlign: 'center', color: '#231934', marginBottom: 12 },
  logoBlue: { color: '#246BFD' },
  label: { fontWeight: '600', fontSize: 15, marginBottom: 6 },
  inputWrapper: { backgroundColor: '#F2F2F2', borderRadius: 12, marginBottom: 16, paddingHorizontal: 12 },
  inputWrapperRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F2', borderRadius: 12, marginBottom: 16, paddingHorizontal: 12 },
  input: { height: 48, fontSize: 16 },
    inputWithIconRow: { flex: 1, height: 48, fontSize: 16, paddingLeft: 36, paddingRight: 36, marginTop: 0, marginBottom: 0, textAlignVertical: 'center' },
  button: { backgroundColor: '#246BFD', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  amicoImg: { width: 180, height: 120, alignSelf: 'center', marginBottom: 16 },
  amicoImgLarge: { width: 260, height: 200, alignSelf: 'center', marginBottom: 16 },
    inputIcon: { position: 'absolute', left: 18, top: '50%', marginTop: -10, zIndex: 2 },
  inputIconRight: { position: 'absolute', right: 18, top: '50%', marginTop: -10, zIndex: 2 },
});
