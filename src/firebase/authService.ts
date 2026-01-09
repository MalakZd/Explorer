import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// ------------------------------------

// 🔹 ADMIN: GESTION UTILISATEURS
import { collection, getDocs, updateDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

// Récupérer tous les utilisateurs
export const getAllUsers = async () => {
  const usersCol = collection(db, "users");
  const userSnapshot = await getDocs(usersCol);
  return userSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

// Supprimer un utilisateur partout (Firestore + Auth) via Cloud Function
export const deleteUser = async (uid: string) => {
  const functions = getFunctions();
  const deleteUserEverywhere = httpsCallable(functions, 'deleteUserEverywhere');
  await deleteUserEverywhere({ uid });
};

// Modifier le rôle d'un utilisateur
export const setUserRole = async (uid: string, role: string) => {
  await updateDoc(doc(db, "users", uid), { role });
};
// 🔹 REGISTER
// ------------------------------------
export const registerUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      firstName,
      lastName,
      role: "user",
      createdAt: serverTimestamp(),
    });

    return cred.user;
  } catch (error: any) {
    throw formatFirebaseError(error.code);
  }
};

// ------------------------------------
// 🔹 LOGIN
// ------------------------------------
export const loginUser = async (email: string, password: string) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (error: any) {
    throw formatFirebaseError(error.code);
  }
};

// ------------------------------------
// 🔹 LOGOUT
// ------------------------------------
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.log("Logout error:", error);
    throw new Error("Une erreur est survenue lors de la déconnexion.");
  }
};

// ------------------------------------
// 🔹 MAPPER D’ERREURS FIREBASE → MESSAGE USER
// ------------------------------------
const formatFirebaseError = (code: string) => {
  switch (code) {
    case "auth/invalid-email":
      return "Adresse email invalide";
    case "auth/user-not-found":
      return "Aucun compte trouvé avec cet email";
    case "auth/wrong-password":
      return "Mot de passe incorrect";
    case "auth/email-already-in-use":
      return "Cet email est déjà utilisé";
    case "auth/weak-password":
      return "Mot de passe trop faible (min. 6 caractères)";
    case "auth/missing-password":
      return "Veuillez entrer un mot de passe";
    default:
      return "Une erreur est survenue. Réessayez.";
  }
};
