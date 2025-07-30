import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/functions';

const firebaseConfig = {
  // Your web app's Firebase configuration
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
  // measurementId: "YOUR_FIREBASE_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const functions = firebase.functions();

// Connect to Firebase Emulators if in development environment
if (__DEV__) { // __DEV__ is a global variable in React Native that is true in development
  const EMULATOR_HOST = 'localhost'; // Or the host where your emulators are running

  auth.useEmulator(`http://${EMULATOR_HOST}:9099`); // Default Auth emulator port
  firestore.useEmulator(EMULATOR_HOST, 8080); // Default Firestore emulator port
  storage.useEmulator(`http://${EMULATOR_HOST}:9199`); // Default Storage emulator port
  functions.useEmulator(EMULATOR_HOST, 5001); // Default Functions emulator port
}

export default firebase;