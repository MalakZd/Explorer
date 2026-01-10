import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, ImageBackground, NativeScrollEvent, NativeSyntheticEvent, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';
import LoginScreen from './LoginScreen';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    image: require('../../assets/images/discover.jpg'),
    text: 'Discover hidden places and local gems shared by people from your city',
  },
  {
    image: require('../../assets/images/friends.jpg'),
    text: 'Connect with locals and explore cafés, viewpoints, and secret spots together',
  },
  {
    image: require('../../assets/images/photos.jpg'),
    text: 'Save your favorite places and explore the city like a true local',
  },
];


export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [index, setIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const imageTranslateY = useRef(new Animated.Value(0)).current;
  const [showLogin, setShowLogin] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        console.log('Pan started');
      },
      onPanResponderMove: (_, gestureState) => {
        console.log('Pan moving:', gestureState.dy);
        if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy);
          // Move image up slightly as user swipes
          imageTranslateY.setValue(gestureState.dy * 0.3);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        console.log('Pan released:', gestureState.dy);
        if (gestureState.dy < -80) {
          // Swipe up threshold
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: -height,
              useNativeDriver: true,
              tension: 50,
              friction: 8,
            }),
            Animated.timing(imageOpacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(imageTranslateY, {
              toValue: -height * 0.3,
              useNativeDriver: true,
              tension: 50,
              friction: 8,
            }),
          ]).start(() => {
            console.log('Animation complete, showing login');
            setShowLogin(true);
          });
        } else {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(imageTranslateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollPosition / width);
    setIndex(currentIndex);
  };

  const handleNext = () => {
    if (index < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  };

  const handleGetStarted = () => {
    navigation.replace('Login');
  };

  const renderItem = ({ item, index: slideIndex }: { item: typeof slides[0], index: number }) => {
    const isLastSlide = slideIndex === slides.length - 1;
    return (
      <Animated.View 
        style={[{ flex: 1 }, isLastSlide && { transform: [{ translateY: imageTranslateY }] }]}
      >
        <ImageBackground source={item.image} style={styles.slide} resizeMode="cover">
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.03)', 'rgba(26, 26, 46, 0.36)', '#0d0d19ff']}
            style={styles.gradient}
          />
          <View style={styles.content}>
            <View style={styles.spacer} />
            <Text style={styles.text}>{item.text}</Text>
          </View>
        </ImageBackground>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.onboardingContainer,
          index === slides.length - 1 && {
            transform: [{ translateY }],
            opacity: imageOpacity,
          }
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderItem}
          keyExtractor={(_, i) => i.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
          scrollEnabled={index !== slides.length - 1 || !showLogin}
        />
        <View style={styles.overlay} pointerEvents={index === slides.length - 1 ? 'box-none' : 'auto'}>
          <View style={styles.paginationWrapper}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, index === i && styles.dotActive]}
              />
            ))}
          </View>
          {index < slides.length - 1 ? (
            <View style={styles.bottomRow}>
              <TouchableOpacity onPress={handleGetStarted}>
                <Text style={styles.skip}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext}>
                <Text style={styles.next}>Next</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View 
              style={styles.swipeUpContainer} 
              {...panResponder.panHandlers}
            >
              <View style={styles.swipeIndicator}>
                <View style={styles.swipeBar} />
              </View>
              <Text style={styles.swipeUpText}>Swipe up to start</Text>
              <Animated.View style={{ opacity: translateY.interpolate({
                inputRange: [-100, 0],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              })}}>
                <Text style={styles.swipeUpIcon}>↑</Text>
              </Animated.View>
            </View>
          )}
        </View>
      </Animated.View>

      {showLogin && (
        <View style={styles.loginContainer}>
          <LoginScreen />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  onboardingContainer: {
    flex: 1,
    zIndex: 10,
  },
  slide: {
    width: width,
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-end',
    paddingBottom: 150,
  },
  spacer: {
    flex: 1,
  },
  text: { 
    color: '#fff', 
    fontSize: 18, 
    textAlign: 'center', 
    marginBottom: 32,
    fontWeight: '500',
    lineHeight: 26,
  },
  overlay: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 24,
  },
  paginationWrapper: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 24,
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: 'rgba(255,255,255,0.3)', 
    marginHorizontal: 4,
  },
  dotActive: { 
    backgroundColor: '#246BFD', 
    width: 24,
  },
  bottomRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%',
  },
  skip: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: 16, 
    fontWeight: '500',
  },
  next: { 
    color: '#246BFD', 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 'auto',
  },
  swipeUpContainer: {
    width: '100%',
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  swipeIndicator: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: 12,
  },
  swipeBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#246BFD',
    borderRadius: 3,
  },
  swipeUpText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  swipeUpIcon: {
    color: '#246BFD',
    fontSize: 32,
    fontWeight: 'bold',
  },
  loginContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
});
