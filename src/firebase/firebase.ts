import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXh_53mJ5XVx4RxKz9dZC_xTsy33X_NDU",
  authDomain: "spotna-3b628.firebaseapp.com",
  projectId: "spotna-3b628",
  storageBucket: "spotna-3b628.firebasestorage.app",
  messagingSenderId: "982547794808",
  appId: "1:982547794808:web:d563f1d8c4c2c7dbe0568d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
