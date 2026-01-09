const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Cloud Function pour supprimer un utilisateur (Firestore + Auth)
exports.deleteUserEverywhere = functions.https.onCall(async (data, context) => {
  // Vérifier que l'appelant est admin (optionnel mais recommandé)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  const { uid } = data;
  if (!uid) throw new functions.https.HttpsError('invalid-argument', 'Missing uid');

  console.log('Suppression demandée pour UID:', uid);
  try {
    await admin.auth().getUser(uid);
    console.log('Utilisateur trouvé dans Auth:', uid);
  } catch (e) {
    console.error('Utilisateur non trouvé dans Auth:', uid, e.message);
    throw new functions.https.HttpsError('not-found', 'Utilisateur non trouvé dans Auth: ' + uid);
  }

  // Supprimer de Auth
  try {
    await admin.auth().deleteUser(uid);
    console.log('Suppression Auth OK pour', uid);
  } catch (e) {
    console.error('Erreur suppression Auth:', uid, e.message);
    throw new functions.https.HttpsError('internal', 'Erreur suppression Auth: ' + e.message);
  }

  // Supprimer de Firestore
  try {
    await admin.firestore().collection('users').doc(uid).delete();
    console.log('Suppression Firestore OK pour', uid);
  } catch (e) {
    console.error('Erreur suppression Firestore:', uid, e.message);
    throw new functions.https.HttpsError('internal', 'Erreur suppression Firestore: ' + e.message);
  }

  return { success: true };
});
