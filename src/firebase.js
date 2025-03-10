import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAj3w_5nx-nWoi_XA5170lcNgmP5NwKFko",
  authDomain: "major-proj-66a23.firebaseapp.com",
  projectId: "major-proj-66a23",
  storageBucket: "major-proj-66a23.appspot.com",
  messagingSenderId: "355550373534",
  appId: "1:355550373534:web:6cf2b9d6261f3d0fdc7d8f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
export const storage = getStorage(app);