// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import 'firebase/compat/auth';
import {getFirestore} from 'firebase/firestore';
import { getDatabase } from "firebase/database";

import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// const firebaseConfig = {
//   apiKey: "AIzaSyAKFp1vn_2FMFcGo8TtgtnIFzK75Ou8cnE",
//   authDomain: "railway-67b08.firebaseapp.com",
//   databaseURL: "https://railway-67b08-default-rtdb.asia-southeast1.firebasedatabase.app/",
//   projectId: "railway-67b08",
//   storageBucket: "railway-67b08.firebasestorage.app",
//   messagingSenderId: "483140652588",
//   appId: "1:483140652588:web:8bade72f7ef6786bf94b89",
//   measurementId: "G-DPSKW7XT1G"
// };

const firebaseConfig = {
  apiKey: "AIzaSyB2qrJj1Tb8RD1c9PORsSwBNr8BjXw5dcA",
  authDomain: "final-railway.firebaseapp.com",
  databaseURL: "https://final-railway-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "final-railway",
  storageBucket: "final-railway.firebasestorage.app",
  messagingSenderId: "1044739212820",
  appId: "1:1044739212820:web:b209073fe6baf31de6c901",
  measurementId: "G-6Q6TP3X8XK"
};



const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const rdb = getDatabase(app);  //realtime database
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
// provider.setCustomParameters({ prompt: "select_account" });
// const analytics = getAnalytics(app);

export { auth, provider, db, rdb, app };
