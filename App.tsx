import React, { useState, useEffect } from 'react';
import { SwipeDeck } from './components/SwipeDeck';
import { MatchesList } from './components/MatchesList';
import { ChatScreen } from './components/ChatScreen';
import { Onboarding } from './components/Onboarding';
import { GiverDashboard } from './components/GiverDashboard';
import { Pet, Match, Species, UserPreferences } from './types';
import { getPetsFromDB, db } from './services/firebase';

// Mock Data (Fallback si no hay Firebase)
const MOCK_PETS: Pet[] = [
  {
    id: '1',
    name: 'Max',
    age: 2,
    species: Species.DOG,
    breed: 'Golden Retriever',
    bio: 'Me encanta jugar a la pelota y los abrazos largos. Busco a alguien con mucha energía.',
    personality: 'Entusiasta, leal, un poco torpe, muy cariñoso, usa exclamaciones',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    distance: 3
  },
  {
    id: '2',
    name: 'Luna',
    age: 1,
    species: Species.CAT,
    breed: 'Siamés',
    bio: 'Reina de la casa. Solo acepto caricias cuando yo quiero. ¿Tienes atún?',
    personality: 'Elegante, un poco altiva, exigente, cariñosa en secreto',
    imageUrl: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=600&q=80',
    distance: 5
  },
  {
    id: '3',
    name: 'Rocky',
    age: 4,
    species: Species.DOG,
    breed: 'Bulldog Francés',
    bio: 'Ronco un poco al dormir pero soy el mejor compañero de Netflix.',
    personality: 'Perezoso, gracioso, le encanta la comida, relajado',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
    distance: 2
  }
];

// Ad Component
const AdBanner = () => (
  <a 
    href="https://www.instagram.com/alba.jazmin.tienda?igsh=MTc1NTBldzM1dHN5bA==" 
    target="_blank" 
    rel="noopener noreferrer"
    className="block w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white text-xs py-2 px-4 text-center shadow-lg hover:opacity-95 transition-opacity z-40"
  >
    <div className="flex items-center justify-center gap-2">
      <i className="fab fa-instagram text-lg"></i>
      <div>
        <span className="font-bold">Alba Jazmín Tienda</span> 
        <span className="mx-1 opacity-75">|</span>
        <span className="font-light">Sublimaciones y Remeras DTF</span>
      </div>
    </div>
  </a>
);

export default function App() {
  const [view, setView] = useState<'deck' | 'matches' | 'chat'>('deck');
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentChatMatch, setCurrentChatMatch] = useState<Match | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [userPrefs, setUserPrefs] = useState<UserPreferences | null>(null);

  // Cargar mascotas reales al iniciar (o al completar onboarding)
  const loadPets = async () => {
    setIsLoadingPets(true);
    try {
      const realPets = await getPetsFromDB();
      if (realPets && realPets.length > 0) {
        setPets(realPets as Pet[]);
      } else {
        // Fallback a Mock si no hay DB o está vacía
        setPets(MOCK_PETS);
      }
    } catch (e) {
      console.error("Error cargando mascotas:", e);
      setPets(MOCK_PETS);
    } finally {
      setIsLoadingPets(false);
    }
  };

  const handleMatch = (pet: Pet, isSuperLike: boolean = false) => {
    const newMatch: Match = {
      pet: pet,
      messages: [],
      lastMessageAt: new Date(),
      isSuperLike: isSuperLike
    };
    
    // Check if already matched to avoid duplicates
    if (!matches.find(m => m.pet.id === pet.id)) {
      setMatches(prev => [newMatch, ...prev]);
    }
  };

  const handleSelectMatch = (match: Match) => {
    setCurrentChatMatch(match);
    setView('chat');
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    setMatches(prev => prev.map(m => m.pet.id === updatedMatch.pet.id ? updatedMatch : m));
    setCurrentChatMatch(updatedMatch);
  };

  const handleOnboardingComplete = (prefs: UserPreferences) => {
    setUserPrefs(prefs);
    loadPets(); // Trigger load
    setOnboardingComplete(true);
  };

  if (!onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // GIVER VIEW
  if (userPrefs?.role === 'GIVER') {
    return (
      <div className="max-w-md mx-auto h-screen bg-white shadow-2xl overflow-hidden relative font-sans text-gray-900 flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          <GiverDashboard userName={userPrefs.name} />
        </div>
        <div className="bg-gray-900">
           <AdBanner />
        </div>
      </div>
    );
  }

  // ADOPTER VIEW
  return (
    <div className="max-w-md mx-auto h-screen bg-gray-50 shadow-2xl overflow-hidden relative font-sans text-gray-900">
      
      {/* View Router */}
      <div className="h-full pb-20 relative">
        {view === 'deck' && (
          <div className="h-full w-full">
            {/* Top Bar */}
            <div className="h-16 bg-white flex items-center justify-between px-5 shadow-sm z-10 relative">
               <div className="w-9 h-9 rounded-full bg-orange-100 overflow-hidden border border-orange-200">
                 <img src={`https://ui-avatars.com/api/?name=${userPrefs?.name}&background=ffedd5&color=f97316`} className="w-full h-full object-cover" />
               </div>
               <div className="flex flex-col items-center">
                 <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
                   <i className="fas fa-paw transform -rotate-12"></i>
                   <span className="tracking-tight">Nueva Vida</span>
                 </div>
                 <span className="text-[10px] text-teal-600 font-bold tracking-widest uppercase opacity-80">Mendoza</span>
               </div>
               <button onClick={() => setView('matches')} className="w-9 h-9 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
                 <i className="fas fa-sliders-h"></i>
               </button>
            </div>
            
            {/* Loading or Deck */}
            {isLoadingPets ? (
              <div className="flex h-full items-center justify-center">
                <i className="fas fa-circle-notch fa-spin text-orange-500 text-3xl"></i>
              </div>
            ) : (
              <SwipeDeck pets={pets} onMatch={handleMatch} />
            )}
            
          </div>
        )}

        {view === 'matches' && (
          <MatchesList matches={matches} onSelectMatch={handleSelectMatch} />
        )}

        {view === 'chat' && currentChatMatch && (
          <div className="absolute inset-0 z-30 bg-white">
            <ChatScreen 
              match={currentChatMatch} 
              onBack={() => setView('matches')} 
              onUpdateMatch={handleUpdateMatch}
            />
          </div>
        )}
      </div>
      
      {/* Ad Banner - Fixed above Bottom Nav */}
      {view !== 'chat' && (
        <div className="absolute bottom-20 left-0 right-0 z-30">
          <AdBanner />
        </div>
      )}

      {/* Bottom Navigation */}
      {view !== 'chat' && (
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex justify-around items-center z-20 pb-4 rounded-t-3xl shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
          <button 
            onClick={() => setView('deck')}
            className={`flex flex-col items-center p-2 rounded-xl transition ${view === 'deck' ? 'text-orange-500 bg-orange-50' : 'text-gray-300 hover:text-gray-400'}`}
          >
            <i className="fas fa-home text-2xl mb-1"></i>
          </button>
          
          <button className="flex flex-col items-center p-2 rounded-xl text-gray-300 hover:text-gray-400">
             <i className="fas fa-search text-2xl mb-1"></i>
          </button>

          <button 
            onClick={() => setView('matches')}
            className={`flex flex-col items-center relative p-2 rounded-xl transition ${view === 'matches' ? 'text-orange-500 bg-orange-50' : 'text-gray-300 hover:text-gray-400'}`}
          >
            <i className="fas fa-comment-alt text-2xl mb-1"></i>
            {matches.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-teal-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          <button className="flex flex-col items-center p-2 rounded-xl text-gray-300 hover:text-gray-400">
             <i className="fas fa-user text-2xl mb-1"></i>
          </button>
        </div>
      )}
    </div>
  );
}