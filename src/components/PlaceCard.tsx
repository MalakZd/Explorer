import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../theme/colors';

interface PlaceCardProps {
  image: ImageSourcePropType;
  name: string;
  city: string;
  rating: number;
  favorite: boolean;
  onFavoritePress?: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ image, name, city, rating, favorite, onFavoritePress }) => (
  <View style={styles.card}>
    <Image source={image} style={styles.image} />
    <TouchableOpacity style={styles.heart} onPress={onFavoritePress}>
      <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={colors.primary} />
    </TouchableOpacity>
    <View style={styles.overlay}>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.row}>
        <Feather name="map-pin" size={14} color={colors.white} />
        <Text style={styles.location}>{city}</Text>
        <Ionicons name="star" size={14} color="#FFD700" style={{ marginLeft: 8 }} />
        <Text style={styles.rating}>{rating}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 1.2,
    marginBottom: 18,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.white,
    elevation: 3,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    resizeMode: 'cover',
  },
  heart: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 6,
    elevation: 2,
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
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    color: colors.white,
    fontSize: 13,
    marginLeft: 4,
  },
  rating: {
    color: colors.white,
    fontSize: 13,
    marginLeft: 2,
    fontWeight: '600',
  },
});

export default PlaceCard;
