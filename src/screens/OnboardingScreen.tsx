import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';

const slides = [
  {
    image: require('../../assets/images/discover.png'),
    text: 'Discover hidden places and local gems shared by people from your city',
  },
  {
    image: require('../../assets/images/friends.png'),
    text: 'Connect with locals and explore cafés, viewpoints, and secret spots together',
  },
  {
    image: require('../../assets/images/photos.png'),
    text: 'Save your favorite places and explore the city like a true local',
  },
];


export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    }
  };

  const handleGetStarted = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image source={slides[index].image} style={styles.image} resizeMode="contain" />
      </View>
      <Text style={styles.text}>{slides[index].text}</Text>
      <View style={styles.paginationWrapper}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, index === i && styles.dotActive]}
          />
        ))}
      </View>
      <View style={styles.bottomRow}>
        {index < slides.length - 1 ? (
          <>
            <TouchableOpacity onPress={handleGetStarted}>
              <Text style={styles.skip}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext}>
              <Text style={styles.next}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.getStartedBtn} onPress={handleGetStarted}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181A20', justifyContent: 'center', alignItems: 'center', padding: 24 },
  imageWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  image: { width: 340, height: 340 },
  text: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 32 },
  paginationWrapper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#444', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#246BFD' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 32 },
  skip: { color: '#fff', fontSize: 16, fontWeight: '500' },
  next: { color: '#246BFD', fontSize: 16, fontWeight: '500', marginLeft: 'auto' },
  getStartedBtn: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center', width: '100%' },
  getStartedText: { color: '#246BFD', fontSize: 16, fontWeight: '700' },
});
