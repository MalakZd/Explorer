import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteUser, getAllUsers, setUserRole } from '../firebase/authService';

const AdminScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const usersList = await getAllUsers();
    setUsers(usersList);
    setLoading(false);
  };

  const handleDelete = async (uid: string) => {
    Alert.alert('Confirmer', 'Supprimer cet utilisateur ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setErrorMsg(null);
          setSuccessMsg(null);
          try {
            await deleteUser(uid);
            setSuccessMsg('Utilisateur supprimé avec succès !');
            fetchUsers();
          } catch (e: any) {
            setErrorMsg("Erreur lors de la suppression : " + (e?.message || ''));
          }
        }
      }
    ]);
  };

  const handleSetAdmin = async (uid: string) => {
    await setUserRole(uid, 'admin');
    fetchUsers();
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <Image
          source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.firstName || '')}+${encodeURIComponent(item.lastName || '')}&background=246BFD&color=fff&size=128` }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={[styles.role, item.role === 'admin' ? styles.adminRole : styles.userRole]}>{item.role || 'user'}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.uid)}>
          <Text style={styles.actionText}>Supprimer</Text>
        </TouchableOpacity>
        {item.role !== 'admin' && (
          <TouchableOpacity style={[styles.actionBtn, styles.adminBtn]} onPress={() => handleSetAdmin(item.uid)}>
            <Text style={styles.actionText}>Rendre Admin</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des utilisateurs</Text>
      {successMsg && <Text style={styles.successMsg}>{successMsg}</Text>}
      {errorMsg && <Text style={styles.errorMsg}>{errorMsg}</Text>}
      {loading ? <Text>Chargement...</Text> : (
        <FlatList
          data={users}
          keyExtractor={item => item.uid}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, backgroundColor: '#F7F9FB' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 40, marginTop: 80, textAlign: 'center', color: '#246BFD', letterSpacing: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#246BFD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 54, height: 54, borderRadius: 27, marginRight: 14, backgroundColor: '#eee' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#231934' },
  email: { fontSize: 14, color: '#888', marginTop: 2 },
  role: { fontSize: 13, marginTop: 4, fontWeight: 'bold', textTransform: 'uppercase', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  adminRole: { backgroundColor: '#246BFD22', color: '#246BFD' },
  userRole: { backgroundColor: '#E0E0E0', color: '#231934' },
  actions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  actionBtn: { borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14, marginLeft: 6 },
  deleteBtn: { backgroundColor: '#FF4B4B' },
  adminBtn: { backgroundColor: '#246BFD' },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  successMsg: { color: '#2ecc40', textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
  errorMsg: { color: '#FF4B4B', textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
});

export default AdminScreen;
