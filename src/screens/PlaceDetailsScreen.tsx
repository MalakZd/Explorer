import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, Linking, Modal, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebase/firebase';
import { notifyPostOwner } from '../firebase/notificationService';
import { RootStackParamList } from '../navigation/types';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetails'>;

type SpotComment = {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string | null;
  text: string;
  createdAt: any;
};

const amenitiesMap: { [key: string]: { icon: string; label: string } } = {
  wifi: { icon: 'wifi', label: 'Wi-Fi' },
  parking: { icon: 'car', label: 'Parking' },
  food: { icon: 'restaurant', label: 'Food' },
  coffee: { icon: 'cafe', label: 'Café' },
  outdoor: { icon: 'leaf', label: 'Outdoor' },
  pet: { icon: 'paw', label: 'Pet Friendly' },
  music: { icon: 'musical-notes', label: 'Music' },
  accessible: { icon: 'accessibility', label: 'Accessible' },
};

const PlaceDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { place } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<SpotComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  
  // Vérifier si le spot est déjà liké au chargement
  useEffect(() => {
    const checkIfLiked = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const likesQuery = query(
          collection(db, 'likes'),
          where('userId', '==', user.uid),
          where('spotId', '==', place.id)
        );
        const snapshot = await getDocs(likesQuery);
        setIsFavorite(!snapshot.empty);
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };

    checkIfLiked();
  }, [place.id]);

  // Charger les commentaires depuis Firestore
  useEffect(() => {
    const loadComments = async () => {
      try {
        const commentsQuery = query(
          collection(db, 'comments'),
          where('spotId', '==', place.id)
        );
        const snapshot = await getDocs(commentsQuery);
        const commentsData = snapshot.docs.map((docSnap: any) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as SpotComment[];
        
        // Trier côté client par date (plus récent en premier)
        commentsData.sort((a, b) => {
          const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return dateB - dateA;
        });
        
        setComments(commentsData);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    loadComments();
  }, [place.id]);

  // Charger le rating de l'utilisateur et la moyenne
  useEffect(() => {
    const loadRatings = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Charger le rating de l'utilisateur
        const userRatingQuery = query(
          collection(db, 'ratings'),
          where('spotId', '==', place.id),
          where('userId', '==', user.uid)
        );
        const userSnapshot = await getDocs(userRatingQuery);
        if (!userSnapshot.empty) {
          setUserRating(userSnapshot.docs[0].data().rating);
        }

        // Charger tous les ratings pour calculer la moyenne
        const allRatingsQuery = query(
          collection(db, 'ratings'),
          where('spotId', '==', place.id)
        );
        const allSnapshot = await getDocs(allRatingsQuery);
        if (!allSnapshot.empty) {
          const ratings = allSnapshot.docs.map(doc => doc.data().rating);
          const sum = ratings.reduce((acc, val) => acc + val, 0);
          setAverageRating(sum / ratings.length);
          setTotalRatings(ratings.length);
        }
      } catch (error) {
        console.error('Error loading ratings:', error);
      }
    };

    loadRatings();
  }, [place.id]);

  // Gérer le like/unlike avec Firestore
  const handleFavorite = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      if (isFavorite) {
        // Unlike: supprimer de Firestore
        const likesQuery = query(
          collection(db, 'likes'),
          where('userId', '==', user.uid),
          where('spotId', '==', place.id)
        );
        const snapshot = await getDocs(likesQuery);
        snapshot.docs.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, 'likes', docSnapshot.id));
        });
        setIsFavorite(false);
      } else {
        // Like: ajouter à Firestore
        await addDoc(collection(db, 'likes'), {
          userId: user.uid,
          spotId: place.id,
          createdAt: serverTimestamp(),
        });
        setIsFavorite(true);
        
        // Envoyer notification au propriétaire du post
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        const userName = userData?.firstName || 'Someone';
        await notifyPostOwner(place.id, 'like', userName);
      }
    } catch (error) {
      console.error('Error handling favorite:', error);
    }
  };
  
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

  // Get amenities from place data
  const displayAmenities = place.amenities
    ? place.amenities.map((amenityId: string) => ({
        icon: amenitiesMap[amenityId]?.icon || 'help-circle',
        label: amenitiesMap[amenityId]?.label || amenityId,
      }))
    : [];

  const handleRating = async (rating: number) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Vérifier si l'utilisateur a déjà noté
      const existingRatingQuery = query(
        collection(db, 'ratings'),
        where('spotId', '==', place.id),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(existingRatingQuery);

      if (!snapshot.empty) {
        // Mettre à jour le rating existant
        const ratingDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'ratings', ratingDoc.id), {
          rating: rating,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Créer un nouveau rating
        await addDoc(collection(db, 'ratings'), {
          spotId: place.id,
          userId: user.uid,
          rating: rating,
          createdAt: serverTimestamp(),
        });
      }

      setUserRating(rating);

      // Recalculer la moyenne
      const allRatingsQuery = query(
        collection(db, 'ratings'),
        where('spotId', '==', place.id)
      );
      const allSnapshot = await getDocs(allRatingsQuery);
      const ratings = allSnapshot.docs.map(doc => doc.data().rating);
      const sum = ratings.reduce((acc, val) => acc + val, 0);
      const newAverage = sum / ratings.length;
      
      setAverageRating(newAverage);
      setTotalRatings(ratings.length);

      // Mettre à jour le ratingAvg dans le document spot
      await updateDoc(doc(db, 'spots', place.id), {
        ratingAvg: newAverage,
      });
      
      console.log(`Rating updated: ${newAverage.toFixed(1)} (${ratings.length} ratings)`);
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Récupérer les infos de l'utilisateur
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      // Ajouter le commentaire à Firestore
      const newCommentRef = await addDoc(collection(db, 'comments'), {
        spotId: place.id,
        userId: user.uid,
        userName: userData?.firstName || 'Anonymous',
        userPhoto: userData?.photoURL || null,
        text: comment,
        createdAt: serverTimestamp(),
      });

      // Ajouter immédiatement au state local
      const newComment: SpotComment = {
        id: newCommentRef.id,
        userId: user.uid,
        userName: userData?.firstName || 'Anonymous',
        userPhoto: userData?.photoURL || null,
        text: comment,
        createdAt: new Date(),
      };
      setComments([newComment, ...comments]);
      
      // Envoyer notification au propriétaire du post
      await notifyPostOwner(place.id, 'comment', userData?.firstName || 'Someone', comment);
      
      setComment("");
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const pricePerNight = Math.floor((place.rating || 4) * 20 + 50);

  return (
    <View style={styles.container}>
      {/* Modal pour afficher la photo en grand */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          <Image source={place.image} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Image */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => setModalVisible(true)} 
          {...panResponder.panHandlers}
        >
          <Animated.Image
            source={place.image}
            style={[styles.heroImage, { transform: [{ scale: imageScale }] }]}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Content Card */}
        <View style={styles.contentCard}>
          {/* Place Name & Location */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.placeName}>{place.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="#001d58ff" />
                <Text style={styles.locationText}>{place.city}</Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price Range</Text>
              <View style={styles.priceTag}>
                <Ionicons name="cash" size={16} color="#246BFD" />
                <Text style={styles.priceAmount}>{place.priceRange || 'Not specified'}</Text>
              </View>
            </View>
          </View>

          {/* What we offer */}
          {displayAmenities.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>What we offer</Text>
              <View style={styles.amenitiesRow}>
                {displayAmenities.map((amenity, idx) => (
                  <View key={idx} style={styles.amenityItem}>
                    <Ionicons name={amenity.icon as any} size={24} color="#1A1A2E" />
                    <Text style={styles.amenityLabel}>{amenity.label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Description */}
          {place.description && (
            <>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{place.description}</Text>
            </>
          )}

          {/* Additional Info */}
          {place.address && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{place.address}</Text>
            </View>
          )}
          {place.openingHours && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{place.openingHours}</Text>
            </View>
          )}

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Rate this place</Text>
            
            {/* Average Rating Display */}
            {totalRatings > 0 && (
              <View style={styles.averageRatingInfo}>
                <Ionicons name="people" size={16} color="#246BFD" />
                <Text style={styles.averageRatingText}>
                  Average: {averageRating.toFixed(1)}/5 ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
                </Text>
              </View>
            )}

            {/* User Rating */}
            <View style={styles.userRatingContainer}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= userRating ? "star" : "star-outline"}
                      size={32}
                      color={star <= userRating ? "#FFD700" : "rgba(26,26,46,0.3)"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {userRating > 0 && (
                <Text style={styles.ratingConfirmation}>✓ You rated: {userRating} {userRating === 1 ? 'star' : 'stars'}</Text>
              )}
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Comments</Text>
            {loadingComments ? (
              <ActivityIndicator size="small" color="#001642ff" style={{ marginVertical: 20 }} />
            ) : comments.length === 0 ? (
              <Text style={styles.noComments}>No comments yet. Be the first to share your experience!</Text>
            ) : (
              comments.map((c) => (
                <View key={c.id} style={styles.commentBubble}>
                  <View style={styles.commentHeader}>
                    {c.userPhoto ? (
                      <Image source={{ uri: c.userPhoto }} style={styles.commentAvatar} />
                    ) : (
                      <View style={[styles.commentAvatar, styles.commentAvatarPlaceholder]}>
                        <Ionicons name="person" size={16} color="#246BFD" />
                      </View>
                    )}
                    <Text style={styles.commentUserName}>{c.userName}</Text>
                  </View>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              ))
            )}
            
            {/* Comment Input */}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Share your experience..."
                placeholderTextColor="rgba(26,26,46,0.4)"
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 200 }} />
        </View>
      </ScrollView>

      {/* Fixed Top Buttons */}
      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.topBtn} 
          onPress={handleFavorite}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#FF6B9D" : "#1A1A2E"} 
          />
        </TouchableOpacity>
      </View>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.mapButton, { opacity: place.latitude && place.longitude ? 1 : 0.5 }]}
          activeOpacity={0.8}
          onPress={() => {
            if (place.latitude && place.longitude) {
              const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
              Linking.openURL(url);
            } else {
              alert('Location coordinates not available for this place.');
            }
          }}
          disabled={!place.latitude || !place.longitude}
        >
          <Ionicons name="map" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.mapButtonText}>View in Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8ECF4',
  },
  scrollView: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    padding: 8,
  },
  fullImage: {
    width: width * 0.95,
    height: height * 0.7,
    borderRadius: 20,
  },
  heroImage: {
    width: width,
    height: height * 0.5,
    backgroundColor: '#1A1A2E',
  },
  topButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  contentCard: {
    backgroundColor: '#E8ECF4',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  placeName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 15,
    color: '#001d58ff',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#7A7A7A',
    marginBottom: 4,
    fontWeight: '500',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#246BFD',
  },
  priceAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#246BFD',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 16,
    marginTop: 8,
  },
  amenitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  amenityItem: {
    alignItems: 'center',
    gap: 8,
  },
  amenityLabel: {
    fontSize: 13,
    color: 'rgba(26,26,46,0.7)',
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: 'rgba(26,26,46,0.8)',
    lineHeight: 22,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(26,26,46,0.7)',
    flex: 1,
  },
  ratingSection: {
    marginTop: 8,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
  },
  averageRatingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26,26,46,0.1)',
  },
  averageRatingText: {
    fontSize: 14,
    color: '#1A1A2E',
    fontWeight: '600',
  },
  userRatingContainer: {
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  starButton: {
    padding: 4,
  },
  ratingConfirmation: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 12,
    fontWeight: '600',
  },
  commentsSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  noComments: {
    fontSize: 14,
    color: 'rgba(26,26,46,0.5)',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  commentBubble: {
    backgroundColor: 'rgba(26,26,46,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentAvatarPlaceholder: {
    backgroundColor: '#E8ECF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#246BFD',
  },
  commentText: {
    fontSize: 14,
    color: 'rgba(26,26,46,0.8)',
    marginLeft: 40,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: 'rgba(26,26,46,0.2)',
  },
  sendBtn: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 32,
    backgroundColor: '#E8ECF4',
    borderTopWidth: 1,
    borderTopColor: 'rgba(26,26,46,0.1)',
  },
  mapButton: {
    backgroundColor: '#1A1A2E',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  mapButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

export default PlaceDetailsScreen;
