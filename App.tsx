
import React, { useState, useCallback, useEffect } from 'react';
import { Pet, AppView, Match, AdopterProfile, Candidate } from './types';
import { MOCK_PETS, APP_NAME } from './constants';
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
import FilterModal from './components/FilterModal'; // Import Filter
import { MessageCircle, User, ChevronLeft, SlidersHorizontal } from 'lucide-react';

// Animation wrapper
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  // --- View State ---
  const [currentView, setCurrentView] = useState<AppView>(AppView.TERMS);
  const [userRole, setUserRole] = useState<'adopter' | 'giver' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // --- Data State ---
  // Combine Mock pets with user published pets for the Adopter View
  
  // Giver Data (Persisted)
  const [myPublishedPets, setMyPublishedPets] = useState<Pet[]>(() => {
    const saved = localStorage.getItem('myPublishedPets');
    return saved ? JSON.parse(saved) : [];
  });

  // Global list of pets for Adopters (Mocks + Published)
  const [allPets, setAllPets] = useState<Pet[]>(() => {
     // In a real app this comes from backend. Here we merge.
     // We start with MOCKS.
     return [...MOCK_PETS];
  });

  // Sync myPublishedPets into allPets for the swipe deck
  useEffect(() => {
     // This is a simple merge strategy for the demo.
     // We filter out any mocks that might conflict by ID (unlikely) and add user pets.
     setAllPets(prev => {
        const userPetIds = new Set(myPublishedPets.map(p => p.id));
        const nonUserPets = prev.filter(p => !userPetIds.has(p.id));
        // Only add AVAILABLE pets
        const availableUserPets = myPublishedPets.filter(p => p.status !== 'adopted');
        return [...MOCK_PETS, ...availableUserPets]; 
     });
  }, [myPublishedPets]);

  // Mock Candidates acting as people who swiped right on Giver's pets (Persisted)
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('candidates');
    return saved ? JSON.parse(saved) : [];
  });

  // Adopter Data (Persisted)
  const [adopterProfile, setAdopterProfile] = useState<AdopterProfile | null>(() => {
    const saved = localStorage.getItem('adopterProfile');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  // Shared Data (Persisted)
  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('matches');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentChatMatch, setCurrentChatMatch] = useState<Match | null>(null);
  
  // Swipe State (Adopter) (Persisted)
  const [swipedIds, setSwipedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('swipedIds');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Filters State
  const [filters, setFilters] = useState<{ type: string | null; ageRange: string | null }>({
    type: null,
    ageRange: null
  });

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('myPublishedPets', JSON.stringify(myPublishedPets));
  }, [myPublishedPets]);

  useEffect(() => {
    localStorage.setItem('candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    if (adopterProfile) {
        localStorage.setItem('adopterProfile', JSON.stringify(adopterProfile));
    }
  }, [adopterProfile]);

  useEffect(() => {
    localStorage.setItem('swipedIds', JSON.stringify(Array.from(swipedIds)));
  }, [swipedIds]);


  // Derived state for current stack
  const visiblePets = allPets.filter(p => {
      // 1. Not swiped
      if (swipedIds.has(p.id)) return false;
      // 2. Available (not adopted)
      if (p.status === 'adopted') return false;
      
      // 3. Apply Filters
      if (filters.type && p.type !== filters.type && p.type !== undefined) return false;
      if (filters.ageRange === 'puppy' && p.age >= 1) return false;
      if (filters.ageRange === 'adult' && p.age < 1) return false;

      return true;
  });
  
  const currentPet = visiblePets.length > 0 ? visiblePets[0] : null;

  // --- Helpers to Generate Mock Data ---
  
  const MOCK_PROFILES = [
    { name: "Sofía", image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Ana", image: "https://randomuser.me/api/portraits/women/68.jpg" },
    { name: "Valentina", image: "https://randomuser.me/api/portraits/women/90.jpg" },
    { name: "Lucía", image: "https://randomuser.me/api/portraits/women/22.jpg" },
    { name: "Juan", image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Carlos", image: "https://randomuser.me/api/portraits/men/86.jpg" },
    { name: "Miguel", image: "https://randomuser.me/api/portraits/men/15.jpg" },
    { name: "Martín", image: "https://randomuser.me/api/portraits/men/44.jpg" }
  ];

  const generateMockCandidatesForPet = (petId: string): Candidate[] => {
    // Generate 1-2 random candidates for a new pet
    const count = Math.floor(Math.random() * 2) + 1;
    const newCandidates: Candidate[] = [];
    
    for (let i = 0; i < count; i++) {
        // Pick a random consistent profile
        const profile = MOCK_PROFILES[Math.floor(Math.random() * MOCK_PROFILES.length)];
        
        newCandidates.push({
            id: `cand-${Date.now()}-${i}`,
            name: profile.name,
            age: 20 + Math.floor(Math.random() * 20),
            image: profile.image,
            housingType: Math.random() > 0.5 ? 'Casa con patio' : 'Departamento',
            familyInfo: Math.random() > 0.5 ? 'Sin niños' : 'Con 1 hijo',
            bio: 'Me encantó tu mascota, tengo mucho amor para dar.',
            applyingForPetId: petId
        });
    }
    return newCandidates;
  };

  // --- Handlers for Onboarding ---
  
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
      if (myPublishedPets.length > 0) {
        setCurrentView(AppView.GIVER_DASHBOARD);
      } else {
        setCurrentView(AppView.GIVER_FORM);
      }
    }
  };

  const handleSwitchRole = () => {
    // Immediate switch without confirmation
    setUserRole(null);
    setCurrentView(AppView.ROLE_SELECTION);
  };

  const handleAdopterSubmit = (data: AdopterProfile) => {
    setAdopterProfile(data);
    setCurrentView(AppView.SWIPE);
  };

  const handleGiverSubmit = (newPet: Pet, addAnother: boolean) => {
    // Determine type simple logic for demo (usually specific input)
    // Assume if "Mestizo" is typed it could be anything, but let's default to cat since user asked for cats.
    // In a real app we would ask Dog or Cat.
    const type: 'dog' | 'cat' | 'other' = 'cat'; // Defaulting to cat for this specific user request flow
    
    const petWithType: Pet = { ...newPet, type, status: 'available' };
    
    setMyPublishedPets(prev => [...prev, petWithType]);
    
    // Simulate incoming requests for this pet immediately for demo purposes
    const newCandidates = generateMockCandidatesForPet(newPet.id);
    setCandidates(prev => [...prev, ...newCandidates]);

    if (!addAnother) {
        setCurrentView(AppView.GIVER_DASHBOARD);
    }
  };

  // --- Handlers for Main App ---

  // ADOPTER: Swiping Right
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (!currentPet) return;

    if (direction === 'right') {
      setSentRequests(prev => new Set(prev).add(currentPet.id));
    }

    setTimeout(() => {
        setSwipedIds(prev => new Set(prev).add(currentPet.id));
    }, 200);
  }, [currentPet]);

  const resetStack = () => {
    setSwipedIds(new Set());
    setFilters({ type: null, ageRange: null }); // Optional: Reset filters too?
  };

  // GIVER: Dashboard Actions
  const handleAcceptCandidate = (candidate: Candidate) => {
     // Create a Match
     const newMatch: Match = {
        id: Date.now().toString(),
        targetId: candidate.id, // I chat with Candidate
        name: candidate.name,
        image: candidate.image,
        subtitle: `Interesado en ${myPublishedPets.find(p => p.id === candidate.applyingForPetId)?.name}`,
        matchedAt: new Date(),
        isGiverView: true
     };

     setMatches(prev => [...prev, newMatch]);
     setCandidates(prev => prev.filter(c => c.id !== candidate.id));
  };

  const handleRejectCandidate = (candidateId: string) => {
     setCandidates(prev => prev.filter(c => c.id !== candidateId));
  };

  const handleMarkAsAdopted = (petId: string) => {
     if (window.confirm("¿Confirmas que esta mascota ha sido adoptada? Dejará de aparecer a otros usuarios.")) {
         setMyPublishedPets(prev => prev.map(p => 
            p.id === petId ? { ...p, status: 'adopted' } : p
         ));
     }
  };

  // SHARED: Open Chat
  const openChat = (match: Match) => {
    setCurrentChatMatch(match);
    setCurrentView(AppView.CHAT);
  };

  // --- Render Functions ---

  // 1. Swipe View (Adopter)
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
                   : 'Has visto a todos los peludos cercanos.'}
             </p>
             <button 
                onClick={resetStack}
                className="px-8 py-3 bg-white border border-orange-200 text-orange-500 font-bold rounded-full shadow-sm hover:bg-orange-50 transition"
             >
                Ver de nuevo
             </button>
          </div>
        )}
      </div>

      {/* Controls */}
      {currentPet && (
        <SwipeControls onSwipe={handleSwipe} onSuperLike={() => handleSwipe('right')} />
      )}
      
      {/* Filters Modal */}
      {showFilters && (
        <FilterModal 
            filters={filters}
            onApply={(f) => setFilters(f)}
            onClose={() => setShowFilters(false)}
        />
      )}

      {/* Ad Banner */}
      <AdBanner />
    </div>
  );

  return (
    <div className="w-full h-[100dvh] bg-gray-100 flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          
          {/* Onboarding Flows */}
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

          {/* Giver Dashboard */}
          {currentView === AppView.GIVER_DASHBOARD && (
             <motion.div key="giver-dash" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GiverDashboard 
                    myPets={myPublishedPets}
                    candidates={candidates}
                    onAcceptCandidate={handleAcceptCandidate}
                    onRejectCandidate={handleRejectCandidate}
                    onMarkAdopted={handleMarkAsAdopted}
                    onOpenChat={(id) => {
                        const m = matches.find(m => m.targetId === id);
                        if(m) openChat(m);
                    }}
                    matches={matches}
                    onLogout={handleSwitchRole}
                    onAddPet={() => setCurrentView(AppView.GIVER_FORM)}
                />
                {/* Floating button to verify matches */}
                <div className="absolute bottom-20 right-6 z-20">
                    <button 
                        onClick={() => setCurrentView(AppView.MATCHES)}
                        className="w-14 h-14 bg-teal-600 rounded-full shadow-lg shadow-teal-300 text-white flex items-center justify-center relative"
                    >
                        <MessageCircle size={28} />
                        {matches.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-xs font-bold flex items-center justify-center border-2 border-white">{matches.length}</span>
                        )}
                    </button>
                </div>
             </motion.div>
          )}


          {/* Main App Flows */}
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
                    matches={matches} 
                    onSelectMatch={openChat} 
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
                    match={currentChatMatch}
                    matchData={
                        // If I'm giver, I need candidate data. If adopter, I need Pet data.
                        currentChatMatch.isGiverView 
                        ? { id: currentChatMatch.targetId, name: currentChatMatch.name, image: currentChatMatch.image, age: 25, housingType: 'Casa', familyInfo: '-', bio: '', applyingForPetId: '' } as Candidate
                        : { id: currentChatMatch.targetId, name: currentChatMatch.name, image: currentChatMatch.image, breed: 'Mestizo', age: 3, personality: 'Friendly', bio: 'Soy un amor', tags: [], distance: 2 } as Pet
                    }
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
