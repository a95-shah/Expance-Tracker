import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCoMhWwfU1K4SMavo46gJOubpF1RQkCj0",
  authDomain: "expance-tracker-e816e.firebaseapp.com",
  projectId: "expance-tracker-e816e",
  storageBucket: "expance-tracker-e816e.firebasestorage.app",
  messagingSenderId: "1012244558146",
  appId: "1:1012244558146:web:b013296c22e4edf36098db",
  measurementId: "G-FR8CD378J4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);