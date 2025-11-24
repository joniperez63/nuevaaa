import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { collection, query, onSnapshot, where, addDoc, serverTimestamp, getDoc, setDoc, doc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, appId, storage } from '../firebaseConfig.ts';
import { UserProfile, Pet, Interaction, ChatSession } from '../types.ts';
import { Button, Input, Checkbox } from '../components/UI.tsx';
import { MessageCircle, Camera } from 'lucide-react';

interface GiverDashboardProps {
  user: User;
  userData: UserProfile;
  onOpenChat: (chatSession: ChatSession) => void;
}

export const GiverDashboard: React.FC<GiverDashboardProps> = ({ user, userData, onOpenChat }) => {
  const [tab, setTab] = useState<'list' | 'upload' | 'interactions'>('list');
  const [myPetsList, setMyPetsList] = useState<Pet[]>([]);
  const [interactionsList, setInteractionsList] = useState<Interaction[]>([]);
  
  // Upload State
  const [newPet, setNewPet] = useState({ name: '', castrated: false, vaccinated: false });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Listen to my pets
    const qPets = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'pets'), 
      where('ownerId', '==', user.uid)
    );
    const unsubPets = onSnapshot(qPets, (snap) => {
      setMyPetsList(snap.docs.map(d => ({ id: d.id, ...d.data() } as Pet)));
    });

    // Listen to interactions
    const qInt = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'interactions'), 
      where('ownerId', '==', user.uid)
    );
    const unsubInt = onSnapshot(qInt, (snap) => {
      setInteractionsList(snap.docs.map(d => ({ id: d.id, ...d.data() } as Interaction)));
    });

    return () => { unsubPets(); unsubInt(); };
  }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPet.name || !imageFile || !userData.location) {
        alert("Completa todos los campos y sube una foto.");
        return;
    }

    setUploading(true);
    try {
      // 1. Upload Image
      const imgRef = storageRef(storage, `pets/${user.uid}/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imgRef, imageFile);
      const url = await getDownloadURL(imgRef);

      // 2. Save Pet
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'pets'), {
        ...newPet,
        photoUrl: url,
        ownerId: user.uid,
        location: userData.location,
        createdAt: serverTimestamp()
      });

      setTab('list');
      setNewPet({ name: '', castrated: false, vaccinated: false });
      setImageFile(null);
    } catch (e) {
      console.error(e);
      alert("Error al subir. Verifica tu conexión.");
    }
    setUploading(false);
  };

  const startChat = async (interaction: Interaction) => {
    // Unique Chat ID logic
    const ids = [user.uid, interaction.adopterId].sort();
    const chatId = `${ids[0]}_${ids[1]}_${interaction.petId}`; 

    const chatRef = doc(db, 'artifacts', appId, 'public', 'data', 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        participants: [user.uid, interaction.adopterId],
        petId: interaction.petId,
        petName: interaction.petName,
        lastMessage: '',
        updatedAt: serverTimestamp()
      });
    }

    onOpenChat({ 
        id: chatId, 
        otherUser: { uid: interaction.adopterId, name: interaction.adopterName } 
    });
  };

  return (
    <div className="pb-32">
      <div className="flex border-b bg-white sticky top-0 z-10">
        <button 
          onClick={() => setTab('list')}
          className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'list' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50' : 'text-gray-500'}`}
        >
          Mis Mascotas
        </button>
        <button 
          onClick={() => setTab('interactions')}
          className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'interactions' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50' : 'text-gray-500'}`}
        >
          Interesados <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{interactionsList.length}</span>
        </button>
        <button 
          onClick={() => setTab('upload')}
          className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'upload' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50' : 'text-gray-500'}`}
        >
          Subir
        </button>
      </div>

      <div className="p-4">
        {tab === 'list' && (
          <div className="space-y-4">
            {myPetsList.length === 0 && <p className="text-center text-gray-500 mt-10">Aún no has publicado mascotas.</p>}
            {myPetsList.map(pet => (
              <div key={pet.id} className="flex bg-white rounded-xl shadow-sm p-3 gap-4 items-center border border-gray-100">
                <img src={pet.photoUrl} alt={pet.name} className="w-20 h-20 rounded-lg object-cover bg-gray-200" />
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{pet.name}</h3>
                  <div className="text-xs text-gray-500 flex gap-2 mt-1">
                    {pet.castrated && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">Castrado</span>}
                    {pet.vaccinated && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Vacunado</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'interactions' && (
          <div className="space-y-3">
             {interactionsList.length === 0 && <p className="text-center text-gray-500 mt-10">Nadie ha deslizado a la derecha aún.</p>}
             {interactionsList.map(inxt => (
               <div key={inxt.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                 <div className="flex justify-between items-center mb-3">
                   <span className="font-bold text-gray-800">{inxt.adopterName}</span>
                   <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Interés en {inxt.petName}</span>
                 </div>
                 <Button onClick={() => startChat(inxt)} variant="secondary" className="w-full text-sm py-2">
                   <MessageCircle size={16} /> Iniciar Chat
                 </Button>
               </div>
             ))}
          </div>
        )}

        {tab === 'upload' && (
          <form onSubmit={handleUpload} className="space-y-4 bg-white p-5 rounded-xl shadow-md">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-48 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors relative">
               <input 
                 type="file" 
                 accept="image/*"
                 onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                 className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
               />
               {imageFile ? (
                   <div className="text-center p-4">
                     <p className="text-green-600 font-bold break-all">{imageFile.name}</p>
                     <p className="text-xs text-gray-400 mt-1">Toca para cambiar</p>
                   </div>
               ) : (
                 <div className="text-center">
                   <Camera className="text-gray-400 mb-2 w-10 h-10 mx-auto" />
                   <p className="text-sm text-gray-500 font-medium">Toca para subir foto</p>
                 </div>
               )}
            </div>

            <Input 
              label="Nombre de la mascota" 
              value={newPet.name} 
              onChange={e => setNewPet({...newPet, name: e.target.value})} 
              placeholder="Ej: Firulais"
            />
            
            <div className="flex gap-4 p-2 bg-gray-50 rounded-lg">
              <Checkbox 
                label="¿Castrado?" 
                checked={newPet.castrated} 
                onChange={v => setNewPet({...newPet, castrated: v})} 
              />
              <Checkbox 
                label="¿Vacunado?" 
                checked={newPet.vaccinated} 
                onChange={v => setNewPet({...newPet, vaccinated: v})} 
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={uploading}>
              {uploading ? 'Subiendo...' : 'Publicar Mascota'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};