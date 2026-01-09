import { Button, StyleSheet, Text, View } from 'react-native';
import { logoutUser } from '../firebase/authService';

const AdminProfileScreen = () => {
  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil Administrateur</Text>
      <Button title="Se déconnecter" color="#FF4B4B" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 30 },
});

export default AdminProfileScreen;
