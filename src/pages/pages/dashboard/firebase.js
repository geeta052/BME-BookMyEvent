const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");
const { getStorage } = require("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyAj3w_5nx-nWoi_XA5170lcNgmP5NwKFko",
  authDomain: "major-proj-66a23.firebaseapp.com",
  projectId: "major-proj-66a23",
  storageBucket: "major-proj-66a23.appspot.com",
  messagingSenderId: "355550373534",
  appId: "1:355550373534:web:6cf2b9d6261f3d0fdc7d8f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const storage = getStorage(app);

module.exports = { db, auth, storage };
