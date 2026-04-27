import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBsbtaMusPX7ho-PMSbg0hlk3MUwg9z1vs",
  authDomain: "rakshak-22cc1.firebaseapp.com",
  projectId: "rakshak-22cc1",
  storageBucket: "rakshak-22cc1.firebasestorage.app",
  messagingSenderId: "381155363690",
  appId: "1:381155363690:web:589a0bc48ea6e620707313",
  measurementId: "G-JN8085BX7S"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
