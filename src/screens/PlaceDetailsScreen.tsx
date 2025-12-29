import { Feather, Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Linking, Modal, PanResponder, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';
import colors from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetails'>;

const PlaceDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { place } = route.params;
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const imageScale = useState(new Animated.Value(1))[0];
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(imageScale, {
          toValue: 0.97,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderRelease: () => {
        Animated.spring(imageScale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const handleAddComment = () => {
    if (comment.trim()) {
      setComments([...comments, comment]);
      setComment("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Modal pour afficher la photo en grand */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={32} color={colors.white} />
            </TouchableOpacity>
            <Image source={place.image} style={styles.fullImage} resizeMode="contain" />
          </View>
        </Modal>
        <View>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setModalVisible(true)} {...panResponder.panHandlers}>
            <Animated.Image
              source={place.image}
              style={[styles.image, { transform: [{ scale: imageScale }] }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.overlay}>
            <Text style={styles.name}>{place.name}</Text>
            <View style={styles.row}>
              <Feather name="map-pin" size={16} color={colors.white} />
              <Text style={styles.location}>{place.city}</Text>
              <Ionicons name="star" size={16} color="#FFD700" style={{ marginLeft: 8 }} />
              <Text style={styles.rating}>{place.rating}</Text>
            </View>
          </View>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ height: 32 }} />
          <View style={styles.detailsCard}>
            <TouchableOpacity
              style={[styles.mapBtn, { opacity: place.latitude && place.longitude ? 1 : 0.5 }]}
              onPress={() => {
                if (place.latitude && place.longitude) {
                  const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
                  Linking.openURL(url);
                } else {
                  alert('Coordonnées non disponibles pour ce lieu.');
                }
              }}
              activeOpacity={place.latitude && place.longitude ? 0.85 : 1}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.mapBtnText}>Voir sur la carte</Text>
                <Ionicons name="map" size={20} color={colors.white} style={{ marginLeft: 8 }} />
              </View>
            </TouchableOpacity>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.infoText}>{place.address || 'Adresse inconnue'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.infoText}>{place.openingHours || 'Horaires non disponibles'}</Text>
            </View>
            <Text style={styles.description}>{place.description}</Text>
          </View>
        </ScrollView>
        {/* Section commentaires FIXE en bas */}
        <View style={styles.commentsFixedSection}>
          <Text style={styles.commentsTitle}>Commentaires</Text>
          {comments.length === 0 ? (
            <Text style={styles.noComments}>Aucun commentaire pour l'instant.</Text>
          ) : (
            <ScrollView style={{ maxHeight: 120 }}>
              {comments.map((c, idx) => (
                <View key={idx} style={styles.commentBubble}>
                  <Text style={styles.commentText}>{c}</Text>
                </View>
              ))}
            </ScrollView>
          )}
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Écrire un commentaire..."
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment}>
              <Ionicons name="send" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
        commentsFixedSection: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 18,
          shadowColor: '#6C63FF',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
          elevation: 8,
          borderTopWidth: 2,
          borderColor: '#F2F2F2',
          zIndex: 10,
        },
      infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 2,
      },
      infoText: {
        fontSize: 15,
        color: '#444',
        fontWeight: '500',
      },
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullImage: {
      width: '95%',
      height: '80%',
      borderRadius: 24,
      backgroundColor: '#222',
    },
    modalCloseBtn: {
      position: 'absolute',
      top: 40,
      right: 30,
      zIndex: 2,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 24,
      padding: 8,
    },
  container: {
    flex: 1,
    backgroundColor: '#F7F7FA',
  },
  image: {
    width: '100%',
    height: 280,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    // marginBottom: -32, // retire le décalage négatif
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(35,25,52,0.65)',
    padding: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  name: {
    color: colors.white,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  location: {
    color: colors.white,
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '500',
  },
  rating: {
    color: colors.white,
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '700',
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    padding: 8,
    zIndex: 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  mapBtn: {
    backgroundColor: colors.primary || '#6C63FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  mapBtnText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#222',
    marginTop: 10,
    lineHeight: 22,
    marginBottom: 4,
  },
  commentsSection: {
    marginTop: 32,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.primary || '#6C63FF',
  },
  noComments: {
    color: '#888',
    fontSize: 15,
    marginBottom: 8,
  },
  commentBubble: {
    backgroundColor: '#F7F7FA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 15,
    color: '#222',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F7F7FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
    color: '#222',
  },
  sendBtn: {
    backgroundColor: colors.primary || '#6C63FF',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PlaceDetailsScreen;
