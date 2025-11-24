import { db } from '../firebaseConfig';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  getDocs, 
  updateDoc, 
  doc, 
  orderBy, 
  limit,
  serverTimestamp,
  setDoc,
  getDoc
} from "firebase/firestore";
import { Pet, AdopterProfile, Candidate, Match, Message } from '../types';

// --- User Management ---
export const getUserId = () => {
  let id = localStorage.getItem('nueva_vida_user_id');
  if (!id) {
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('nueva_vida_user_id', id);
  }
  return id;
};

export const saveAdopterProfile = async (profile: AdopterProfile) => {
  const userId = getUserId();
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, { ...profile, id: userId, role: 'adopter' }, { merge: true });
};

export const getAdopterProfile = async (userId: string): Promise<AdopterProfile | null> => {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        return snap.data() as AdopterProfile;
    }
    return null;
}

// --- Pet Management (Giver) ---

// Helper to compress image string
const compressImage = (base64Str: string, maxWidth = 600) => {
    return new Promise<string>((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
    });
};

export const addPetToDb = async (pet: Pet) => {
  const userId = getUserId();
  
  // Try to compress main image if it's base64
  let optimizedImage = pet.image;
  if(pet.image.startsWith('data:image')) {
      optimizedImage = await compressImage(pet.image);
  }

  // Compress gallery
  let optimizedGallery: string[] = [];
  if (pet.images) {
      for (const img of pet.images) {
          if (img.startsWith('data:image')) {
              optimizedGallery.push(await compressImage(img));
          } else {
              optimizedGallery.push(img);
          }
      }
  }

  await addDoc(collection(db, "pets"), {
    ...pet,
    image: optimizedImage,
    images: optimizedGallery,
    ownerId: userId,
    createdAt: Date.now(),
    status: 'available'
  });
};

export const listenToMyPets = (userId: string, callback: (pets: Pet[]) => void) => {
  const q = query(collection(db, "pets"), where("ownerId", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const pets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pet));
    callback(pets);
  });
};

export const markPetAsAdoptedInDb = async (petId: string) => {
  const petRef = doc(db, "pets", petId);
  await updateDoc(petRef, { status: 'adopted' });
};

// --- Swiping & Candidates ---

export const getAllPets = async (currentUserId: string): Promise<Pet[]> => {
  // Simple fetch, filtering is done client side for this MVP to avoid complex indexes
  const q = query(collection(db, "pets"), where("status", "==", "available"));
  const snapshot = await getDocs(q);
  const pets: Pet[] = [];
  
  // Also get my swipes to exclude them
  const swipesQ = query(collection(db, "likes"), where("adopterId", "==", currentUserId));
  const swipesSnap = await getDocs(swipesQ);
  const swipedPetIds = new Set(swipesSnap.docs.map(d => d.data().petId));

  snapshot.forEach(doc => {
    const data = doc.data() as Pet;
    // Don't show my own pets and don't show already swiped
    if (data.ownerId !== currentUserId && !swipedPetIds.has(doc.id)) {
        pets.push({ id: doc.id, ...data });
    }
  });
  
  return pets;
};

export const sendLike = async (pet: Pet, adopter: AdopterProfile) => {
  const userId = getUserId();
  
  // Check if like exists
  const q = query(collection(db, "likes"), where("adopterId", "==", userId), where("petId", "==", pet.id));
  const existing = await getDocs(q);
  if (!existing.empty) return;

  await addDoc(collection(db, "likes"), {
    petId: pet.id,
    petOwnerId: pet.ownerId,
    adopterId: userId,
    adopterName: adopter.name,
    adopterImage: adopter.profileImage, // Should be compressed in profile save
    adopterHousing: adopter.housingType,
    adopterFamily: adopter.hasChildren ? 'Con niños' : 'Sin niños',
    createdAt: Date.now(),
    status: 'pending' // pending approval
  });
};

// Listen for likes on MY pets (Giver Dashboard)
export const listenToCandidates = (userId: string, callback: (candidates: Candidate[]) => void) => {
  const q = query(
    collection(db, "likes"), 
    where("petOwnerId", "==", userId), 
    where("status", "==", "pending")
  );
  
  return onSnapshot(q, (snapshot) => {
    const candidates = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id, // Like ID
        adopterId: data.adopterId,
        name: data.adopterName,
        age: 0, // Not stored in like, irrelevant for list card
        image: data.adopterImage,
        housingType: data.adopterHousing,
        familyInfo: data.adopterFamily,
        bio: 'Me encantaría adoptar a esta mascota.',
        applyingForPetId: data.petId,
        createdAt: data.createdAt
      } as Candidate;
    });
    callback(candidates);
  });
};

export const rejectCandidate = async (likeId: string) => {
    await updateDoc(doc(db, "likes", likeId), { status: 'rejected' });
};

// --- Matching ---

export const acceptCandidate = async (candidate: Candidate, pet: Pet) => {
    // 1. Update Like status
    await updateDoc(doc(db, "likes", candidate.id), { status: 'accepted' });

    // 2. Create Match
    const userId = getUserId(); // I am the owner
    
    // Check if match already exists
    const q = query(
        collection(db, "matches"), 
        where("petId", "==", pet.id), 
        where("adopterId", "==", candidate.adopterId)
    );
    const existing = await getDocs(q);
    if (!existing.empty) return;

    await addDoc(collection(db, "matches"), {
        petId: pet.id,
        petName: pet.name,
        petImage: pet.image,
        ownerId: userId,
        adopterId: candidate.adopterId,
        adopterName: candidate.name,
        adopterImage: candidate.image,
        matchedAt: Date.now(),
        lastMessage: '',
        lastMessageTimestamp: Date.now()
    });
};

export const listenToMatches = (userId: string, callback: (matches: Match[]) => void) => {
    // Matches where I am owner OR adopter
    // Firestore OR queries are tricky, so we'll do two listeners or just client merge if lists are small.
    // Ideally we duplicate the match info or use an array field "participants".
    // For MVP: We listen to two queries and merge.
    
    // BUT simpler: `participants` array field
    // Let's rely on simple client side filtering of a broader query or two queries.
    
    // Query 1: As Owner
    const q1 = query(collection(db, "matches"), where("ownerId", "==", userId));
    // Query 2: As Adopter
    const q2 = query(collection(db, "matches"), where("adopterId", "==", userId));
    
    let matches1: Match[] = [];
    let matches2: Match[] = [];
    
    const notify = () => {
        const combined = [...matches1, ...matches2].sort((a,b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
        callback(combined);
    };

    const u1 = onSnapshot(q1, (snap) => {
        matches1 = snap.docs.map(d => ({id: d.id, ...d.data()} as Match));
        notify();
    });

    const u2 = onSnapshot(q2, (snap) => {
        matches2 = snap.docs.map(d => ({id: d.id, ...d.data()} as Match));
        notify();
    });
    
    return () => { u1(); u2(); };
};

// --- Chat ---

export const listenToMessages = (matchId: string, callback: (msgs: Message[]) => void) => {
    const q = query(
        collection(db, `matches/${matchId}/messages`), 
        orderBy("timestamp", "asc")
    );
    return onSnapshot(q, (snap) => {
        const msgs = snap.docs.map(d => ({id: d.id, ...d.data()} as Message));
        callback(msgs);
    });
};

export const sendMessage = async (matchId: string, text: string) => {
    const userId = getUserId();
    const timestamp = Date.now();
    
    await addDoc(collection(db, `matches/${matchId}/messages`), {
        senderId: userId,
        text,
        timestamp
    });
    
    // Update match last message
    await updateDoc(doc(db, "matches", matchId), {
        lastMessage: text,
        lastMessageTimestamp: timestamp
    });
};
