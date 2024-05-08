import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from "@env";

const firebaseConfig = {
  apiKey: "AIzaSyA02qQLG8KEayuFUaoRh-srkSYX8GBtqkg",
  authDomain: "angkasv2.firebaseapp.com",
  projectId: "angkasv2",
  storageBucket: "angkasv2.appspot.com",
  messagingSenderId: "167136779991",
  appId: "1:167136779991:web:f6e327297eac3cc9bd1a92",
  measurementId: "G-0GJ2DSRDPN"
}

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
