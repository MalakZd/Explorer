import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from './firebase';

export const createNotification = async (
  userId: string,
  postId: string,
  postName: string,
  type: 'like' | 'comment',
  userName: string,
  message: string
) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      postId,
      postName,
      type,
      userName,
      message,
      timestamp: serverTimestamp(),
      read: false
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const notifyPostOwner = async (
  postId: string,
  type: 'like' | 'comment',
  currentUserName: string,
  commentText?: string
) => {
  try {
    // Get post details and owner
    const postQuery = query(collection(db, 'spots'), where('__name__', '==', postId));
    const postSnapshot = await getDocs(postQuery);
    
    if (!postSnapshot.empty) {
      const postData = postSnapshot.docs[0].data();
      const postOwnerId = postData.createdBy;
      const postName = postData.name;

      // Don't notify if the user is the post owner
      const currentUserId = require('./firebase').auth.currentUser?.uid;
      if (postOwnerId === currentUserId) {
        return;
      }

      let message = '';
      if (type === 'like') {
        message = `${currentUserName} liked your post "${postName}"`;
      } else if (type === 'comment') {
        message = `${currentUserName} commented on your post "${postName}"${commentText ? `: "${commentText}"` : ''}`;
      }

      await createNotification(
        postOwnerId,
        postId,
        postName,
        type,
        currentUserName,
        message
      );
    }
  } catch (error) {
    console.error('Error notifying post owner:', error);
  }
};
