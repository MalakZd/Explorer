import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import AccountInfoScreen from '../screens/AccountInfoScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  AccountInfo: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
