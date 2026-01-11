
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCurrentUserRole } from './src/hooks/useCurrentUserRole';
import AdminTabNavigator from './src/navigation/AdminTabNavigator';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { RootStackParamList } from './src/navigation/types';
import AccountCreatedScreen from './src/screens/AccountCreatedScreen';

import AddSpotScreen from './src/screens/AddSpotScreen';
import LoginScreen from './src/screens/LoginScreen';
import MyPostsScreen from './src/screens/MyPostsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import PlaceDetailsScreen from './src/screens/PlaceDetailsScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SplashScreen from './src/screens/SplashScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { role, loading } = useCurrentUserRole();

  if (loading) {
    return null; // ou un écran de chargement
  }

  return (
    <NavigationContainer>
      {role === 'admin' ? (
        <AdminTabNavigator />
      ) : (
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="AccountCreated" component={AccountCreatedScreen} />
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
          <Stack.Screen name="AddSpot" component={AddSpotScreen} />
          <Stack.Screen name="MyPosts" component={MyPostsScreen} />
          <Stack.Screen name="LikedPlaces" component={require('./src/screens/LikedPlacesScreen').default} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          {/* <Stack.Screen name="AccountInfo" component={AccountInfoScreen} /> */}

        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
