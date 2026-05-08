// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-D1hL4rARsEfXdIdY9lRndV0WyNST_9A",
  authDomain: "ebenezerhousing-2026.firebaseapp.com",
  databaseURL: "https://ebenezerhousing-2026-default-rtdb.firebaseio.com",
  projectId: "ebenezerhousing-2026",
  storageBucket: "ebenezerhousing-2026.firebasestorage.app",
  messagingSenderId: "991721495372",
  appId: "1:991721495372:web:bcdfe8bb83b63b4c5bcde9",
  measurementId: "G-0VTQZ2PZD9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


// Export the services so LandlordDashboard.js can find them
export const rtdb = getDatabase(app);
export const storage = getStorage(app);