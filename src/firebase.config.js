// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBGirfbmG9Q61LKhlAgmXqEFNbxz_uWVy0',
  authDomain: 'house-marketplace-9db0a.firebaseapp.com',
  projectId: 'house-marketplace-9db0a',
  storageBucket: 'house-marketplace-9db0a.appspot.com',
  messagingSenderId: '472394531292',
  appId: '1:472394531292:web:cbd6cdc1939e06376f8f19',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore();
