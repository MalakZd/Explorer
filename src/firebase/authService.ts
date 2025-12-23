import { auth, db } from "./firebase";
import { signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// ------------------------------------
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
