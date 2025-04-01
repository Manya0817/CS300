import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDR8V1E0rnsBb6ATfSnM-dZCjCQEmHY6RI",
  authDomain: "eventease-2602a.firebaseapp.com",
  projectId: "eventease-2602a",
  storageBucket: "eventease-2602a.appspot.com",
  messagingSenderId: "99246231347",
  appId: "1:99246231347:web:30e83be0673cb3cc9cf846"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);





export { app, auth, db };