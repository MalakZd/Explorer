import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Dimensions, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/images/photos.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 20, 60, 0.7)', 'rgba(0, 0, 0, 0.9)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.centered}>
          <Image 
            source={require('../../assets/images/logo-white.png')} 
            style={styles.mainImage} 
            resizeMode="contain" 
          />
          <Text style={styles.tagline}>Find Your Dream Spot with Us</Text>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  mainImage: {
    width: width * 0.5,
    height: height * 0.3,
    maxWidth: 250,
    maxHeight: 250,
  },
  tagline: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
