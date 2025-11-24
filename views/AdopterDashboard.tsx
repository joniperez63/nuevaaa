import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db, appId } from '../firebaseConfig.ts';
import { UserProfile, Pet } from '../types.ts';
import { calculateDistance } from '../utils.ts';
import { PetCard } from '../components/PetCard.tsx';
import { Button, Loading } from '../components/UI.tsx';
import { X, Heart, Dog } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface AdopterDashboardProps {
  user: User;
  userData: UserProfile;
}

export const AdopterDashboard: React.FC<AdopterDashboardProps> = ({ user, userData }) => {
  const [feed, setFeed] = useState<Pet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!user || !userData.location) return;

    const fetchPets = async () => {
      // 1. Get all public pets
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'pets'));
      
      const unsubscribePets = onSnapshot(q, async (snapshot) => {
         // 2. Get my past interactions to filter already swiped pets
        const interactionsQ = query(
          collection(db, 'artifacts', appId, 'public', 'data', 'interactions'),
          where('adopterId', '==', user.uid)
        );

        // We use a one-time fetch for interactions here to build the initial feed
        // In a real app, you might want to listen to interactions too, but for simplicity:
        onSnapshot(interactionsQ, (intSnap) => {
            const swipedPetIds = new Set(intSnap.docs.map(d => d.data().petId));

            const processedPets = snapshot.docs
            .map(doc => {
              const data = doc.data() as Omit<Pet, 'id' | 'distance'>;
              return {
                id: doc.id,
                ...data,
                distance: calculateDistance(
                  userData.location?.lat, userData.location?.lng,
                  data.location?.lat, data.location?.lng
                )
              };
            })
            .filter(p => !swipedPetIds.has(p.id) && p.ownerId !== user.uid)
            .sort((a, b) => parseFloat(a.distance || '0') - parseFloat(b.distance || '0'));
  
            setFeed(processedPets);
            setLoading(false);
        });
      });
      
      return () => unsubscribePets();
    };

    fetchPets();
  }, [user, userData]);

  const swipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= feed.length) return;
    const pet = feed[currentIndex];
    
    if (direction === 'right') {
      try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'interactions'), {
          adopterId: user.uid,
          petId: pet.id,
          ownerId: pet.ownerId,
          petName: pet.name,
          petPhoto: pet.photoUrl,
          adopterName: userData.name,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      } catch (e) { console.error(e); }
    }
    
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) return <Loading />;

  if (feed.length === 0 || currentIndex >= feed.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
            <Dog className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-600">No hay más mascotas cerca</h3>
        <p className="text-gray-500 mt-2">Vuelve a intentar más tarde o amplía tu búsqueda.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">
            Recargar
        </Button>
      </div>
    );
  }

  const currentPet = feed[currentIndex];

  return (
    <div className="flex flex-col items-center pt-6 px-4 h-full">
       <AnimatePresence>
            <PetCard 
                key={currentPet.id}
                pet={currentPet} 
                onSwipe={swipe} 
            />
       </AnimatePresence>
       
       <div className="flex gap-8 mt-8 pb-24">
         <button 
           onClick={() => swipe('left')}
           className="w-16 h-16 bg-white rounded-full shadow-lg shadow-gray-200 flex items-center justify-center text-red-500 border border-gray-100 active:scale-90 transition-transform hover:bg-red-50"
         >
           <X size={32} strokeWidth={3} />
         </button>
         <button 
           onClick={() => swipe('right')}
           className="w-16 h-16 bg-green-500 rounded-full shadow-lg shadow-green-200 flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-green-600"
         >
           <Heart size={32} fill="white" />
         </button>
       </div>
    </div>
  );
};