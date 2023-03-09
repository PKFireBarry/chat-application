import { initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
import {getAuth, GoogleAuthProvider} from 'firebase/auth';
import { getMessaging, getToken } from "firebase/messaging";





const firebaseConfig = {
  apiKey: "AIzaSyC-0AXlk988yd-wnDTKhlYwaCE0Fqks5Fk",
  authDomain: "chat-app-fb1dd.firebaseapp.com",
  projectId: "chat-app-fb1dd",
  storageBucket: "chat-app-fb1dd.appspot.com",
  messagingSenderId: "111281479581",
  appId: "1:111281479581:web:93a0ee9ee0fd495ccb9974",
  measurementId: "G-77L7EW3QF5"
  };



// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const messaging = getMessaging(app);



