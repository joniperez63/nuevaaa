
import React, { useState } from 'react';
import { Pet, Candidate } from '../types';
import { MessageCircle, Check, X, User, Eye, ChevronLeft, Plus, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdBanner from './AdBanner';
import PetCard from './PetCard';

interface GiverDashboardProps {
  myPets: Pet[];
  candidates: Candidate[];
  onAcceptCandidate: (candidate: Candidate) => void;
  onRejectCandidate: (candidateId: string) => void;
  onMarkAdopted: (petId: string) => void; // New Prop
  onOpenChat: (candidateId: string) => void;
  matches: { targetId: string }[];
  onLogout: () => void;
  onAddPet: () => void;
}

const GiverDashboard: React.FC<GiverDashboardProps> = ({ 
  myPets, 
  candidates, 
  onAcceptCandidate, 
  onRejectCandidate,
  onMarkAdopted,
  onOpenChat,
  matches,
  onLogout,
  onAddPet
}) => {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [previewPet, setPreviewPet] = useState<Pet | null>(null);

  // Filter candidates for selected pet (or show all if none selected)
  // Only show candidates for available pets unless specific one selected
  const visibleCandidates = selectedPetId 
    ? candidates.filter(c => c.applyingForPetId === selectedPetId) 
    : candidates.filter(c => {
         // Show candidates for all pets? Or only available ones? 
         // Let's show all but maybe visually distinguish later
         return true; 
    });

  const getPetName = (id: string) => myPets.find(p => p.id === id)?.name || 'Mascota';
  const selectedPet = myPets.find(p => p.id === selectedPetId);

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm z-50 relative flex items-center gap-4">
        <button 
          onClick={onLogout}
          className="p-2 -ml-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-full transition"
          title="Volver"
        >
          <ChevronLeft size={28} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800">Panel de Adopción</h1>
          <p className="text-sm text-gray-500">Administra tus mascotas y solicitudes</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        
        {/* My Pets Carousel */}
        <section className="p-6 pb-2">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Mis Mascotas</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                <button 
                    onClick={() => setSelectedPetId(null)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition ${!selectedPetId ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                    Todas
                </button>
                {myPets.map(pet => (
                    <div key={pet.id} className="relative group">
                         <button 
                            onClick={() => setSelectedPetId(pet.id)}
                            className={`flex-shrink-0 flex items-center gap-2 pr-10 pl-1 py-1 rounded-full border transition ${
                                selectedPetId === pet.id ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-600 border-gray-200'
                            } ${pet.status === 'adopted' ? 'opacity-75 grayscale' : ''}`}
                        >
                            <img src={pet.image} alt={pet.name} className="w-8 h-8 rounded-full object-cover" />
                            <span className="text-sm font-bold flex items-center gap-1">
                                {pet.name}
                                {pet.status === 'adopted' && <Check size={12} className="text-emerald-500" />}
                            </span>
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setPreviewPet(pet);
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-black/10 hover:bg-black/20 rounded-full text-gray-700 hover:text-black transition"
                            title="Ver perfil"
                        >
                            <Eye size={14} />
                        </button>
                    </div>
                ))}
                
                <button 
                    onClick={onAddPet}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center hover:bg-teal-100 transition shadow-sm"
                    title="Agregar Mascota"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Actions for Selected Pet */}
            {selectedPet && selectedPet.status !== 'adopted' && (
                 <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                 >
                    <button 
                        onClick={() => onMarkAdopted(selectedPet.id)}
                        className="w-full py-3 bg-emerald-50 text-emerald-600 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition flex items-center justify-center gap-2"
                    >
                        <Award size={20} />
                        Marcar {selectedPet.name} como Adoptado/a
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-2">
                        Esto ocultará a la mascota de la búsqueda pública.
                    </p>
                 </motion.div>
            )}
        </section>

        {/* Candidates List */}
        <section className="px-6 pb-20">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">
                Solicitudes Pendientes ({visibleCandidates.length})
            </h2>
            
            {visibleCandidates.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No hay solicitudes nuevas por ahora.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                    {visibleCandidates.map(candidate => {
                        const isMatched = matches.some(m => m.targetId === candidate.id);
                        const pet = myPets.find(p => p.id === candidate.applyingForPetId);
                        
                        return (
                            <motion.div 
                                key={candidate.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden"
                            >
                                {pet?.status === 'adopted' && (
                                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                                        YA ADOPTADO
                                    </div>
                                )}

                                <div className="flex items-start gap-4 mb-4">
                                    <img src={candidate.image} alt={candidate.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg text-gray-800">{candidate.name}</h3>
                                            <span className="text-xs font-bold bg-teal-50 text-teal-600 px-2 py-1 rounded-md">
                                                Para: {pet?.name}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{candidate.age} años • {candidate.housingType}</p>
                                        <p className="text-xs text-gray-400 mt-1">{candidate.familyInfo}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-xl mb-4 text-sm text-gray-600 italic border-l-4 border-teal-200">
                                    "{candidate.bio}"
                                </div>

                                {isMatched ? (
                                    <button 
                                        onClick={() => onOpenChat(candidate.id)}
                                        className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                                    >
                                        <MessageCircle size={20} />
                                        Chatear con {candidate.name}
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => onRejectCandidate(candidate.id)}
                                            className="flex-1 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition"
                                        >
                                            Rechazar
                                        </button>
                                        <button 
                                            onClick={() => onAcceptCandidate(candidate)}
                                            className="flex-1 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition shadow-md shadow-teal-200 flex items-center justify-center gap-2"
                                        >
                                            <Check size={18} />
                                            Aceptar
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                    </AnimatePresence>
                </div>
            )}
        </section>
      </div>
      
      {/* Pet Preview Modal */}
      {previewPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <button 
                onClick={() => setPreviewPet(null)}
                className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
            >
                <X size={32} />
            </button>
            <div className="w-full max-w-sm h-[600px] bg-white rounded-3xl overflow-hidden relative">
                <PetCard 
                    pet={previewPet} 
                    isFront={true} 
                    onSwipe={() => {}} 
                />
            </div>
        </div>
      )}

      <AdBanner />
    </div>
  );
};

export default GiverDashboard;
