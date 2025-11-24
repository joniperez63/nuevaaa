
import React, { useState, useCallback, useEffect } from 'react';
import { Pet, AppView, Match, AdopterProfile, Candidate, MatchUI } from './types';
import { APP_NAME } from './constants';
import PetCard from './components/PetCard';
import SwipeControls from './components/SwipeControls';
import MatchesView from './components/MatchesView';
import ChatInterface from './components/ChatInterface';
import TermsAndConditions from './components/TermsAndConditions';
import RoleSelection from './components/RoleSelection';
import AdopterForm from './components/AdopterForm';
import GiverForm from './components/GiverForm';
import GiverDashboard from './components/GiverDashboard';
import AdBanner from './components/AdBanner';
import FilterModal from './components/FilterModal'; 
import { MessageCircle, User, ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { 
  getUserId, 
  getAllPets, 
  listenToMyPets, 
  addPetToDb, 
  sendLike, 
  listenToCandidates, 
  listenToMatches, 
  acceptCandidate, 
  rejectCandidate,
  saveAdopterProfile,
  getAdopterProfile,
  markPetAsAdoptedInDb
} from './services/db';

// Animation wrapper
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  // --- View State ---
  const [currentView, setCurrentView] = useState<AppView>(AppView.TERMS);
  const [userRole, setUserRole] = useState<'adopter' | 'giver' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [userId, setUserId] = useState<string>('');
  
  // --- Data State ---
  const [myPublishedPets, setMyPublishedPets] = useState<Pet[]>([]);
  const [stackPets, setStackPets] = useState<Pet[]>([]); // Pets for adopter to swipe
  const [candidates, setCandidates] = useState<Candidate[]>([]); // For giver
  const [adopterProfile, setAdopterProfile] = useState<AdopterProfile | null>(null);
  
  // Matches
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentChatMatch, setCurrentChatMatch] = useState<MatchUI | null>(null);
  
  // Local state for swipes in this session to avoid repeats immediately
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());

  // Filters State
  const [filters, setFilters] = useState<{ type: string | null; ageRange: string | null }>({
    type: null,
    ageRange: null
  });

  // --- Initialization ---
  useEffect(() => {
    // Ensure we have a user ID
    const id = getUserId();
    setUserId(id);

    // Try to load existing profile
    getAdopterProfile(id).then(p => {
        if(p) setAdopterProfile(p);
    });
  }, []);

  // --- Listeners based on Role ---
  
  // 1. Listen for Matches (Global for now, so notifications work)
  useEffect(() => {
      if (!userId) return;
      const unsubscribe = listenToMatches(userId, (newMatches) => {
          setMatches(newMatches);
      });
      return () => unsubscribe();
  }, [userId]);

  // 2. Listen for My Pets & Candidates (If Giver)
  useEffect(() => {
      if (!userId || userRole !== 'giver') return;

      const unsubPets = listenToMyPets(userId, (pets) => {
          setMyPublishedPets(pets);
      });

      const unsubCandidates = listenToCandidates(userId, (cands) => {
          setCandidates(cands);
      });

      return () => {
          unsubPets();
          unsubCandidates();
      };
  }, [userId, userRole]);

  // 3. Load Pets for Swiping (If Adopter)
  useEffect(() => {
      if (!userId || userRole !== 'adopter') return;
      
      const loadPets = async () => {
          const pets = await getAllPets(userId);
          setStackPets(pets);
      };
      loadPets();
  }, [userId, userRole]);


  // Derived state for current stack
  const visiblePets = stackPets.filter(p => {
      // 1. Not swiped in this session
      if (swipedIds.has(p.id)) return false;
      // 2. Status check (DB handles filter, but realtime updates might lag)
      if (p.status === 'adopted') return false;
      
      // 3. Apply Filters
      if (filters.type && p.type !== filters.type && p.type !== undefined) return false;
      if (filters.ageRange === 'puppy' && p.age >= 1) return false;
      if (filters.ageRange === 'adult' && p.age < 1) return false;

      return true;
  });
  
  const currentPet = visiblePets.length > 0 ? visiblePets[0] : null;

  // --- Handlers ---
  
  const handleAcceptTerms = () => {
    setCurrentView(AppView.ROLE_SELECTION);
  };

  const handleRoleSelect = (role: 'adopter' | 'giver') => {
    setUserRole(role);
    if (role === 'adopter') {
      if (adopterProfile) {
        setCurrentView(AppView.SWIPE);
      } else {
        setCurrentView(AppView.ADOPTER_FORM);
      }
    } else {
       // Logic to check if user has pets is now async, so we default to Dashboard if they have posted before, 
       // but since we rely on listeners, let's just go to Dashboard. If empty, dashboard handles it.
       // Or go to dashboard and if empty list, show "Add Pet" CTA.
       setCurrentView(AppView.GIVER_DASHBOARD);
    }
  };

  const handleSwitchRole = () => {
    setUserRole(null);
    setCurrentView(AppView.ROLE_SELECTION);
  };

  const handleAdopterSubmit = async (data: AdopterProfile) => {
    setAdopterProfile(data);
    await saveAdopterProfile(data);
    setCurrentView(AppView.SWIPE);
  };

  const handleGiverSubmit = async (newPet: Pet, addAnother: boolean) => {
    // Force type for this specific user request
    const petWithType: Pet = { ...newPet, type: 'cat' }; // Default cat
    
    await addPetToDb(petWithType);
    
    if (!addAnother) {
        setCurrentView(AppView.GIVER_DASHBOARD);
    }
  };

  // ADOPTER: Swiping Right
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (!currentPet || !adopterProfile) return;

    if (direction === 'right') {
       sendLike(currentPet, adopterProfile);
    }

    setTimeout(() => {
        setSwipedIds(prev => new Set(prev).add(currentPet.id));
    }, 200);
  }, [currentPet, adopterProfile]);

  const resetStack = async () => {
    setSwipedIds(new Set());
    // reload
    if (userId) {
        const pets = await getAllPets(userId);
        setStackPets(pets);
    }
    setFilters({ type: null, ageRange: null }); 
  };

  // GIVER: Dashboard Actions
  const handleAcceptCandidate = async (candidate: Candidate) => {
     const pet = myPublishedPets.find(p => p.id === candidate.applyingForPetId);
     if(pet) {
         await acceptCandidate(candidate, pet);
     }
  };

  const handleRejectCandidate = async (candidateId: string) => {
     await rejectCandidate(candidateId);
  };

  const handleMarkAsAdopted = async (petId: string) => {
     if (window.confirm("¿Confirmas que esta mascota ha sido adoptada?")) {
         await markPetAsAdoptedInDb(petId);
     }
  };

  // SHARED: Open Chat
  const openChat = (match: Match) => {
    const isGiver = match.ownerId === userId;
    
    // Transform raw match to UI match
    const uiMatch: MatchUI = {
        id: match.id,
        targetId: isGiver ? match.adopterId : match.ownerId, // Not really used for DB, but for UI key
        name: isGiver ? match.adopterName : match.petName,
        image: isGiver ? match.adopterImage : match.petImage,
        subtitle: isGiver ? `Interesado en ${match.petName}` : `Dueño de ${match.petName}`,
        isGiverView: isGiver,
        matchData: match
    };
    
    setCurrentChatMatch(uiMatch);
    setCurrentView(AppView.CHAT);
  };
  
  // Transform matches for list view
  const uiMatches: MatchUI[] = matches.map(m => {
     const isGiver = m.ownerId === userId;
     return {
        id: m.id,
        targetId: isGiver ? m.adopterId : m.ownerId,
        name: isGiver ? m.adopterName : m.petName,
        image: isGiver ? m.adopterImage : m.petImage,
        subtitle: isGiver ? `Interesado en ${m.petName}` : `Dueño de ${m.petName}`,
        isGiverView: isGiver,
        matchData: m
     };
  });

  // --- Render Functions ---

  const renderSwipeView = () => (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white z-50 shadow-sm relative">
        <div className="flex items-center gap-3">
            <button 
                onClick={handleSwitchRole}
                className="text-gray-400 hover:text-orange-500 transition"
                title="Volver"
            >
                <ChevronLeft size={28} />
            </button>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                {adopterProfile?.profileImage ? (
                    <img src={adopterProfile.profileImage} alt="Me" className="w-full h-full object-cover" />
                ) : (
                    <User size={16} className="text-orange-500" />
                )}
            </div>
        </div>
        <h1 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-1">
            {APP_NAME}
        </h1>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowFilters(true)}
                className={`p-2 rounded-full transition ${filters.type || filters.ageRange ? 'text-orange-500 bg-orange-50' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <SlidersHorizontal size={24} />
            </button>
            <button onClick={() => setCurrentView(AppView.MATCHES)} className="relative">
                <MessageCircle size={28} className="text-gray-400 hover:text-orange-500 transition" />
                {matches.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center border border-white">
                        {matches.length}
                    </span>
                )}
            </button>
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative w-full max-w-lg mx-auto overflow-hidden my-2">
        {currentPet ? (
           <div className="relative w-full h-full">
             {visiblePets.length > 1 && (
                <PetCard 
                    key={visiblePets[1].id} 
                    pet={visiblePets[1]} 
                    isFront={false} 
                    onSwipe={() => {}} 
                />
             )}
             <PetCard 
                key={currentPet.id} 
                pet={currentPet} 
                isFront={true}
                onSwipe={handleSwipe}
             />
           </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
             <div className="mb-4 relative">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                    <User size={40} className="text-orange-300" />
                </div>
             </div>
             <h2 className="text-xl font-bold text-gray-700 mb-2">No hay más mascotas</h2>
             <p className="text-gray-500 mb-8">
                {filters.type || filters.ageRange 
                   ? 'Prueba ajustando los filtros.' 
                   : 'Has visto a todos los peludos disponibles.'}
             </p>
             <button 
                onClick={resetStack}
                className="px-8 py-3 bg-white border border-orange-200 text-orange-500 font-bold rounded-full shadow-sm hover:bg-orange-50 transition"
             >
                Actualizar lista
             </button>
          </div>
        )}
      </div>

      {currentPet && (
        <SwipeControls onSwipe={handleSwipe} onSuperLike={() => handleSwipe('right')} />
      )}
      
      {showFilters && (
        <FilterModal 
            filters={filters}
            onApply={(f) => setFilters(f)}
            onClose={() => setShowFilters(false)}
        />
      )}

      <AdBanner />
    </div>
  );

  return (
    <div className="w-full h-[100dvh] bg-gray-100 flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          
          {currentView === AppView.TERMS && (
            <motion.div key="terms" className="h-full" exit={{ opacity: 0 }}>
              <TermsAndConditions onAccept={handleAcceptTerms} />
            </motion.div>
          )}

          {currentView === AppView.ROLE_SELECTION && (
             <motion.div key="role" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <RoleSelection onSelectRole={handleRoleSelect} />
             </motion.div>
          )}

          {currentView === AppView.ADOPTER_FORM && (
             <motion.div key="adopter-form" className="h-full" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}>
               <AdopterForm onSubmit={handleAdopterSubmit} onBack={() => setCurrentView(AppView.ROLE_SELECTION)} />
             </motion.div>
          )}

          {currentView === AppView.GIVER_FORM && (
             <motion.div key="giver-form" className="h-full" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}>
               <GiverForm onSubmit={handleGiverSubmit} onBack={() => setCurrentView(AppView.ROLE_SELECTION)} />
             </motion.div>
          )}

          {currentView === AppView.GIVER_DASHBOARD && (
             <motion.div key="giver-dash" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GiverDashboard 
                    myPets={myPublishedPets}
                    candidates={candidates}
                    onAcceptCandidate={handleAcceptCandidate}
                    onRejectCandidate={handleRejectCandidate}
                    onMarkAdopted={handleMarkAsAdopted}
                    onOpenChat={(candidateId) => {
                        // Find match with this candidate
                        const cand = candidates.find(c => c.id === candidateId);
                        if (cand) {
                            const m = matches.find(m => m.adopterId === cand.adopterId && m.petId === cand.applyingForPetId);
                            if(m) openChat(m);
                        }
                    }}
                    matches={matches.map(m => ({ targetId: m.adopterId }))} // Only need target for UI check
                    onLogout={handleSwitchRole}
                    onAddPet={() => setCurrentView(AppView.GIVER_FORM)}
                />
             </motion.div>
          )}

          {currentView === AppView.SWIPE && (
            <motion.div 
                key="swipe"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
            >
                {renderSwipeView()}
            </motion.div>
          )}

          {currentView === AppView.MATCHES && (
            <motion.div 
                key="matches"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="h-full absolute inset-0 z-30"
            >
                <MatchesView 
                    matches={uiMatches} 
                    onSelectMatch={(m) => {
                        setCurrentChatMatch(m);
                        setCurrentView(AppView.CHAT);
                    }} 
                    onBack={() => setCurrentView(userRole === 'giver' ? AppView.GIVER_DASHBOARD : AppView.SWIPE)}
                />
            </motion.div>
          )}

          {currentView === AppView.CHAT && currentChatMatch && (
            <motion.div 
                key="chat"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="h-full absolute inset-0 z-40"
            >
                <ChatInterface 
                    matchUI={currentChatMatch}
                    onBack={() => setCurrentView(AppView.MATCHES)} 
                />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default App;