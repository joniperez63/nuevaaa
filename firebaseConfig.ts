import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// We use the provided configuration directly to ensure it works immediately on Vercel
// without needing complex Environment Variable setup.
const firebaseConfig = {
  apiKey: "AIzaSyDkT0PwmxRT7h1xBHgSh3pNUJuUbAYLB1M",
  authDomain: "nueva-vida-meneoza.firebaseapp.com",
  projectId: "nueva-vida-meneoza",
  storageBucket: "nueva-vida-meneoza.firebasestorage.app",
  messagingSenderId: "1039547273492",
  appId: "1:1039547273492:web:ee44a88af2cbaebdceb201",
  measurementId: "G-VNQWHBZKEW"
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let appId = 'default-app';

try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Check for app_id override (legacy support, rarely used now)
    if (typeof (window as any).__app_id !== 'undefined') {
        appId = (window as any).__app_id;
    }
} catch (e) {
    console.error("Firebase initialization failed:", e);
}

// Export services
export { 
    auth, 
    db, 
    storage, 
    appId 
};