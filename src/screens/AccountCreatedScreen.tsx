import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RootStackParamList } from '../navigation/types';

export default function AccountCreatedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={styles.container}>
      <View style={styles.illustrationWrapper}>
        <Image source={require('../../assets/images/account-created.png')} style={styles.illustration} resizeMode="contain" />
      </View>
      <Text style={styles.title}>account created  Successfully !</Text>
      <Text style={styles.subtitle}>You will be moved to the login right now.\nsign in to enjoy SpotNa</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Back to login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 24 },
  illustrationWrapper: { width: '100%', alignItems: 'center', marginBottom: 32 },
  illustration: { width: 220, height: 220 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 32 },
  button: { backgroundColor: '#246BFD', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
