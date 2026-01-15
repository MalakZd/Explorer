import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EditAdminProfileScreen from '../screens/EditAdminProfileScreen';
import SecurityScreen from '../screens/SecurityScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AdminTabNavigator from './AdminTabNavigator';

export type AdminStackParamList = {
  AdminTabs: undefined;
  EditAdminProfile: { adminData: any };
  Security: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      <Stack.Screen name="EditAdminProfile" component={EditAdminProfileScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
