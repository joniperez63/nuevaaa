import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Inicializar Firebase solo si existe la configuración
let app;
let db: any = null;
let storage: any = null;
let auth: any = null;

if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
  
  // Iniciar sesión anónima para permitir lectura/escritura según reglas básicas
  signInAnonymously(auth).catch((error) => {
    console.error("Error en autenticación anónima:", error);
  });
} else {
  console.warn("Falta la configuración de Firebase. La app usará datos de prueba locales.");
}

export { db, storage, auth };

// Helpers para Mascotas
export const savePetToDB = async (petData: any) => {
  if (!db) throw new Error("Base de datos no conectada");
  return await addDoc(collection(db, "pets"), {
    ...petData,
    createdAt: new Date()
  });
};

export const getPetsFromDB = async () => {
  if (!db) return null;
  const q = query(collection(db, "pets"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Helper para subir imagen
export const uploadPetImage = async (file: File) => {
  if (!storage) throw new Error("Almacenamiento no conectado");
  const storageRef = ref(storage, `pets/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};
