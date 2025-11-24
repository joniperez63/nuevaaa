import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDkT0PwmxRT7h1xBHgSh3pNUJuUbAYLB1M",
  authDomain: "nueva-vida-meneoza.firebaseapp.com",
  projectId: "nueva-vida-meneoza",
  storageBucket: "nueva-vida-meneoza.firebasestorage.app",
  messagingSenderId: "1039547273492",
  appId: "1:1039547273492:web:ee44a88af2cbaebdceb201",
  measurementId: "G-VNQWHBZKEW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Analytics is optional for functionality, usually needs more config in some envs
let analytics;
try {
    analytics = getAnalytics(app);
} catch (e) {
    console.log("Analytics not supported in this environment");
}

export { app, analytics };