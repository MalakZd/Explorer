import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: '#0072c6' }]}>
      <View style={styles.centered}>
        <Image source={require('../../assets/images/logo-white.png')} style={styles.logoImg} resizeMode="contain" />
        <Text style={styles.subtitle}>Find Your Dream Spot with Us</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'serif',
    marginBottom: 12,
  },
  logoImg: { width: 180, height: 60, alignSelf: 'center', marginBottom: 12 },
  icon: {
    fontSize: 28,
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
});
