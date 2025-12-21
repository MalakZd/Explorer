
import React from 'react';
import { Platform, Text, View } from 'react-native';
let BottomTabNavigator: React.FC;
if (Platform.OS === 'web') {
  BottomTabNavigator = () => <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Navigation non disponible sur le web.</Text></View>;
} else {
  BottomTabNavigator = require('../src/navigation/BottomTabNavigator').default;
}

export default function HomeScreen() {
  return <BottomTabNavigator />;
}

export const options = {
  headerShown: false,
};
