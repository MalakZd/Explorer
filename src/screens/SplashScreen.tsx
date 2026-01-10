import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;
  
  // Floating location pins
  const pin1Y = useRef(new Animated.Value(-50)).current;
  const pin2Y = useRef(new Animated.Value(-80)).current;
  const pin3Y = useRef(new Animated.Value(-60)).current;
  const pin1Opacity = useRef(new Animated.Value(0)).current;
  const pin2Opacity = useRef(new Animated.Value(0)).current;
  const pin3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(loadingProgress, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating pins animation
    const animatePin = (pinY: Animated.Value, pinOpacity: Animated.Value, delay: number) => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(pinOpacity, {
            toValue: 0.6,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(pinY, {
                toValue: 10,
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(pinY, {
                toValue: -10,
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ])
          ),
        ]),
      ]).start();
    };

    animatePin(pin1Y, pin1Opacity, 800);
    animatePin(pin2Y, pin2Opacity, 1200);
    animatePin(pin3Y, pin3Opacity, 1000);

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#1A1A2E', '#246BFD', '#1A1A2E']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Floating location pins background */}
      <Animated.View style={[styles.floatingPin, styles.pin1, { 
        opacity: pin1Opacity,
        transform: [{ translateY: pin1Y }] 
      }]}>
        <Ionicons name="location" size={60} color="rgba(255,255,255,0.1)" />
      </Animated.View>
      
      <Animated.View style={[styles.floatingPin, styles.pin2, { 
        opacity: pin2Opacity,
        transform: [{ translateY: pin2Y }] 
      }]}>
        <Ionicons name="location-sharp" size={80} color="rgba(255,255,255,0.08)" />
      </Animated.View>
      
      <Animated.View style={[styles.floatingPin, styles.pin3, { 
        opacity: pin3Opacity,
        transform: [{ translateY: pin3Y }] 
      }]}>
        <Ionicons name="location" size={50} color="rgba(255,255,255,0.12)" />
      </Animated.View>

      {/* Main content */}
      <View style={styles.centered}>
        <Animated.View style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [
              { scale: Animated.multiply(logoScale, pulseAnim) }
            ]
          }
        ]}>
          <View style={styles.iconCircle}>
            <Ionicons name="location-sharp" size={60} color="#fff" />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: logoOpacity }}>
          <Image 
            source={require('../../assets/images/logo-white.png')} 
            style={styles.logoImg} 
            resizeMode="contain" 
          />
        </Animated.View>

        <Animated.Text style={[styles.subtitle, { opacity: textOpacity }]}>
          Discover Amazing Places
        </Animated.Text>
        
        <Animated.Text style={[styles.tagline, { opacity: textOpacity }]}>
          Your journey starts here
        </Animated.Text>

        {/* Loading indicator */}
        <Animated.View style={[styles.loadingContainer, { opacity: textOpacity }]}>
          <View style={styles.loadingBar}>
            <Animated.View style={[
              styles.loadingProgress,
              {
                transform: [{ scaleX: loadingProgress }]
              }
            ]} />
          </View>
        </Animated.View>
      </View>

      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#246BFD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImg: { 
    width: 200, 
    height: 70, 
    alignSelf: 'center', 
    marginTop: 20,
    marginBottom: 16,
  },
  subtitle: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 40,
  },
  loadingContainer: {
    width: width * 0.5,
    alignItems: 'center',
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
    transformOrigin: 'left',
  },
  
  // Floating pins
  floatingPin: {
    position: 'absolute',
  },
  pin1: {
    top: '15%',
    left: '10%',
  },
  pin2: {
    top: '25%',
    right: '15%',
  },
  pin3: {
    bottom: '20%',
    left: '20%',
  },

  // Decorative circles
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -100,
    right: -100,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -50,
    left: -50,
  },
});
