import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import LikedPlacesScreen from '../screens/LikedPlacesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import colors from '../theme/colors';
import { RootStackParamList } from './types';
let ExplorerScreen;
if (Platform.OS === 'web') {
  ExplorerScreen = () => <View><Text>Not available on web</Text></View>;
} else {
  ExplorerScreen = require('../screens/ExplorerScreen').default;
}

const Tab = createBottomTabNavigator();

const AddButton = (props: any) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={styles.addBtnContainer}>
      <TouchableOpacity
        {...props}
        style={styles.addBtn}
        onPress={e => {
          e.preventDefault();
          navigation.navigate('AddSpot');
        }}
      >
        <Ionicons name="add" size={32} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const DummyScreen: React.FC = () => <View style={{ flex: 1, backgroundColor: colors.white }} />;

const BottomTabNavigator: React.FC = () => (
  <View style={{ flex: 1, position: 'relative' }}>
    
  {/* TALMNB3D UN9ADU */}

    {/* Blue shadow/gradient behind navbar */}
    {/* <View style={styles.shadowWrapper} pointerEvents="none">
      <LinearGradient
        colors={["#246BFD", "rgba(0, 0, 0, 0)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.navShadow}
      />
    </View> */}
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 70,
          elevation: 10,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
        },
        tabBarIcon: ({ focused }) => {
          let icon;
          if (route.name === 'Home') {
            icon = <Ionicons name="home" size={26} color={focused ? colors.primary : colors.darkText} />;
          } else if (route.name === 'Explore') {
            icon = <Ionicons name="compass-outline" size={26} color={focused ? colors.primary : colors.darkText} />;
          } else if (route.name === 'Favorites') {
            icon = <Ionicons name="heart-outline" size={24} color={focused ? colors.primary : colors.darkText} />;
          } else if (route.name === 'Profile') {
            icon = <Ionicons name="person-outline" size={24} color={focused ? colors.primary : colors.darkText} />;
          }
          return (
            <View style={{ alignItems: 'center' }}>
              {icon}
              {focused && route.name !== 'Add' && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4B4B', marginTop: 4 }} />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExplorerScreen} />
      <Tab.Screen
        name="Add"
        component={DummyScreen}
        options={{
          tabBarButton: props => <AddButton {...props} />,
        }}
      />
      <Tab.Screen name="Favorites" component={LikedPlacesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  </View>
);

const styles = StyleSheet.create({
  addBtnContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  addBtn: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  shadowWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    zIndex: -1,
  },
  navShadow: {
    flex: 1,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    opacity: 0.85,
  },
});

export default BottomTabNavigator;
