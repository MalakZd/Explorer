import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { auth } from "./firebase";

export const uploadProfileImage = async (uri: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Utilisateur non connecté");

  // Convertir l'URI en blob
  const response = await fetch(uri);
  const blob = await response.blob();

  const storage = getStorage();
  const storageRef = ref(storage, `profileImages/${user.uid}.jpg`);
  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
