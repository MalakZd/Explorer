import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import AdminProfileScreen from '../screens/AdminProfileScreen';
import AdminScreen from '../screens/AdminScreen';

const Tab = createBottomTabNavigator();

function DummyAdminPage() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Autre page admin</Text>
    </View>
  );
}

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'settings-outline';
          if (route.name === 'GestionUsers') iconName = 'people-outline';
          if (route.name === 'Dashboard') iconName = 'grid-outline';
          if (route.name === 'AdminProfile') iconName = 'person-circle-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DummyAdminPage} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="GestionUsers" component={AdminScreen} options={{ tabBarLabel: 'Utilisateurs' }} />
      <Tab.Screen name="AdminProfile" component={AdminProfileScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}
