import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDtn_R3a4c5ORzHP-r7QnYYRyOY8qFzTtY",
  authDomain: "businesscircle-bbcf8.firebaseapp.com",
  projectId: "businesscircle-bbcf8",
  storageBucket: "businesscircle-bbcf8.firebasestorage.app",
  messagingSenderId: "379245953499",
  appId: "1:379245953499:web:61852a3dcfc3561c3367fe",
  measurementId: "G-MFNXDY9ZXF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
