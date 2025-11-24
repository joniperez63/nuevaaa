import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';
import { Dog, Info } from 'lucide-react';

import { auth, db, appId } from './firebaseConfig.ts';
import { UserProfile, Role, ChatSession } from './types.ts';
import { Loading } from './components/UI.tsx';

import { RoleSelection } from './views/RoleSelection.tsx';
import { ProfileForm } from './views/ProfileForm.tsx';
import { AdopterDashboard } from './views/AdopterDashboard.tsx';
import { GiverDashboard } from './views/GiverDashboard.tsx';
import { ChatInterface } from './views/ChatInterface.tsx';
import { LegalView } from './views/LegalView.tsx';

type ViewState = 'loading' | 'role-selection' | 'profile-form' | 'adopter-main' | 'giver-main' | 'chat' | 'legal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>('loading');
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch Profile
        const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'data');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setUserData(data);
          setView(data.role === 'adopter' ? 'adopter-main' : 'giver-main');
        } else {
          setView('role-selection');
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRoleSelect = (role: Role) => {
    // Temporary user data with role before saving
    setUserData({ ...userData, role } as UserProfile);
    setView('profile-form');
  };

  const saveProfile = async (formData: Partial<UserProfile>) => {
    if (!user || !userData) return;
    setLoading(true);
    try {
      const profileData: UserProfile = {
        ...formData,
        role: userData.role,
        uid: user.uid,
        createdAt: serverTimestamp()
      } as UserProfile;
      
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), profileData);
      
      setUserData(profileData);
      setView(userData.role === 'adopter' ? 'adopter-main' : 'giver-main');
    } catch (e) {
      console.error("Error saving profile", e);
      alert("Hubo un error guardando tu perfil.");
    }
    setLoading(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen font-sans text-gray-800 relative bg-orange-50">
      
      {/* Global Header (Hidden in chat) */}
      {view !== 'chat' && (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => userData && setView(userData.role === 'adopter' ? 'adopter-main' : 'giver-main')}
          >
            <Dog className="text-orange-500 w-6 h-6" />
            <h1 className="font-bold text-xl text-orange-600 leading-none">
                Nueva Vida <span className="text-green-600 text-sm block">Mendoza</span>
            </h1>
          </div>
          {userData && (
            <button 
                onClick={() => setView('legal')} 
                className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
               <Info size={22} />
            </button>
          )}
        </header>
      )}

      {/* Main Content Area */}
      <main className="max-w-md mx-auto relative h-full min-h-[85vh]">
        <AnimatePresence mode="wait">
          {view === 'role-selection' && (
            <RoleSelection key="role" onSelect={handleRoleSelect} />
          )}
          {view === 'profile-form' && userData && (
            <ProfileForm key="form" role={userData.role} onSave={saveProfile} />
          )}
          {view === 'adopter-main' && user && userData && (
            <AdopterDashboard key="adopter" user={user} userData={userData} />
          )}
          {view === 'giver-main' && user && userData && (
            <GiverDashboard 
              key="giver" 
              user={user} 
              userData={userData} 
              onOpenChat={(session) => {
                setActiveChat(session);
                setSecurityModalOpen(true); // Mandatory security check
                setView('chat');
              }}
            />
          )}
          {view === 'chat' && activeChat && user && (
            <ChatInterface 
              key="chat" 
              user={user} 
              session={activeChat}
              onBack={() => setView(userData?.role === 'adopter' ? 'adopter-main' : 'giver-main')}
              securityModalOpen={securityModalOpen}
              setSecurityModalOpen={setSecurityModalOpen}
            />
          )}
          {view === 'legal' && (
            <LegalView key="legal" onBack={() => setView(userData ? (userData.role === 'adopter' ? 'adopter-main' : 'giver-main') : 'role-selection')} />
          )}
        </AnimatePresence>
      </main>

      {/* FIXED ADVERTISEMENT BANNER */}
      {/* This persists across all views except full-screen modals if needed, but here we keep it always */}
      <a 
        href="https://www.instagram.com/alba.jazmin.tienda?igsh=MTc1NTBldzM1dHN5bA==" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex flex-col items-center justify-center cursor-pointer hover:brightness-110 transition-all no-underline"
      >
        <p className="text-sm font-bold tracking-wide">Personalizá tu mundo con sublimaciones y remeras DTF.</p>
        <p className="text-xs opacity-90 font-medium mt-0.5">Alba Jazmín Tienda 🛍️</p>
      </a>
    </div>
  );
}