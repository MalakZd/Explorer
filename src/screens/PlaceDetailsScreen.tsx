import { Feather, Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';
import colors from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetails'>;

const PlaceDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { place } = route.params;

  return (
    <View style={styles.container}>
      <Image source={place.image} style={styles.image} />
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>
      <View style={styles.overlay}>
        <Text style={styles.name}>{place.name}</Text>
        <View style={styles.row}>
          <Feather name="map-pin" size={14} color={colors.white} />
          <Text style={styles.location}>{place.city}</Text>
          <Ionicons name="star" size={14} color="#FFD700" style={{ marginLeft: 8 }} />
          <Text style={styles.rating}>{place.rating}</Text>
        </View>
      </View>
      {/* Additional details can be added here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  image: {
    width: '100%',
    height: 280,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(35,25,52,0.55)',
    padding: 16,
  },
  name: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    color: colors.white,
    fontSize: 15,
    marginLeft: 4,
  },
  rating: {
    color: colors.white,
    fontSize: 15,
    marginLeft: 2,
    fontWeight: '600',
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 6,
    zIndex: 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PlaceDetailsScreen;
