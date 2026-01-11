import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import colors from '../theme/colors';
import HomeStackNavigator from './HomeStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
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

const BottomTabNavigator: React.FC = () => {
  const unreadCount = useUnreadNotifications();
  
  return (
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
          backgroundColor: '#ffffffff',
          borderTopWidth: 0,
          height: 70,
          elevation: 10,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
        },
        tabBarIcon: ({ focused }) => {
          let icon;
          if (route.name === 'Home') {
            icon = <Ionicons name="home" size={26} color={focused ? '#1A1A2E' : '#383860ff'} />;
          } else if (route.name === 'Explore') {
            icon = <Ionicons name="compass-outline" size={26} color={focused ? '#1A1A2E' : '#383860ff'} />;
          } else if (route.name === 'Favorites') {
            icon = <Ionicons name="heart-outline" size={24} color={focused ? '#1A1A2E' : '#383860ff'} />;
          } else if (route.name === 'Profile') {
            icon = <Ionicons name="person-outline" size={24} color={focused ? '#1A1A2E' : '#383860ff'} />;
          }
          return (
            <View style={{ alignItems: 'center' }}>
              {icon}
              {focused && route.name !== 'Add' && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#1A1A2E', marginTop: 4 }} />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Explore" component={ExplorerScreen} />
      <Tab.Screen
        name="Add"
        component={DummyScreen}
        options={{
          tabBarButton: props => <AddButton {...props} />,
        }}
      />
      <Tab.Screen name="MyPosts" component={require('../screens/MyPostsScreen').default} options={{
        tabBarIcon: ({ focused }) => (
          <View style={{ alignItems: 'center', position: 'relative' }}>
            <Ionicons name="albums-outline" size={26} color={focused ? '#1A1A2E' : '#383860ff'} />
            {unreadCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
            {focused && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#1A1A2E', marginTop: 4 }} />}
          </View>
        ),
        tabBarLabel: 'Mes posts',
      }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  </View>
  );
};

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
    backgroundColor: '#1A1A2E',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -28,
    elevation: 4,
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
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
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default BottomTabNavigator;
