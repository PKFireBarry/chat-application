import {getApp, getApps, initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyC3mEzkGzqBC37Qr1LzmwpV6DxdSMLm1l8",
    authDomain: "chat-application-c9158.firebaseapp.com",
    projectId: "chat-application-c9158",
    storageBucket: "chat-application-c9158.appspot.com",
    messagingSenderId: "1034238864534",
    appId: "1:1034238864534:web:e892f7deb66f31180366b7"
  };


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
