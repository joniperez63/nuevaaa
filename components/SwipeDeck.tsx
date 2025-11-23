import React, { useState } from 'react';
import { Pet } from '../types';
import { PetCard } from './PetCard';

interface SwipeDeckProps {
  pets: Pet[];
  onMatch: (pet: Pet, isSuperLike: boolean) => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({ pets, onMatch }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [programmaticSwipe, setProgrammaticSwipe] = useState<'left' | 'right' | 'up' | null>(null);

  const handleSwipeComplete = (direction: 'left' | 'right' | 'up') => {
    // This is called AFTER the animation completes by the Child component
    if (direction === 'right') {
      onMatch(pets[currentIndex], false);
    } else if (direction === 'up') {
      onMatch(pets[currentIndex], true); // True for Super Like
    }

    setProgrammaticSwipe(null); // Reset trigger
    setCurrentIndex((prev) => prev + 1);
  };

  const triggerSwipe = (direction: 'left' | 'right' | 'up') => {
    setProgrammaticSwipe(direction);
  };

  if (currentIndex >= pets.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <i className="fas fa-search text-4xl text-gray-400"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No hay más mascotas</h2>
        <p className="text-gray-500 mb-6">Hemos buscado por todos lados. Vuelve más tarde o amplía tu búsqueda.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-teal-600 text-white rounded-2xl font-bold shadow-lg hover:bg-teal-700 transition"
        >
          Actualizar Búsqueda
        </button>
      </div>
    );
  }

  // Only render top 2 cards for performance and visual stacking
  const activePet = pets[currentIndex];
  const nextPet = pets[currentIndex + 1];

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background card (Next) */}
      {nextPet && (
         <div className="absolute inset-0 w-full h-full p-4 flex flex-col justify-center items-center opacity-100 transform scale-95 pointer-events-none">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden h-[75vh] border border-gray-200">
               <img src={nextPet.imageUrl} className="h-3/4 w-full object-cover grayscale" />
               <div className="p-6 bg-gray-50 h-1/4"></div>
            </div>
         </div>
      )}

      {/* Active Card */}
      <PetCard 
        key={activePet.id} 
        pet={activePet} 
        active={true} 
        onSwipe={handleSwipeComplete}
        programmaticSwipe={programmaticSwipe}
      />

      {/* Control Buttons */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 z-20 pb-4">
        <button 
          onClick={() => triggerSwipe('left')}
          className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-red-500 text-3xl hover:scale-105 transition border border-gray-200"
        >
          <i className="fas fa-times"></i>
        </button>
        <button 
          onClick={() => triggerSwipe('up')}
          className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-blue-400 text-xl hover:scale-105 transition border border-blue-100"
        >
          <i className="fas fa-star"></i>
        </button>
        <button 
          onClick={() => triggerSwipe('right')}
          className="w-16 h-16 bg-teal-500 rounded-2xl shadow-lg flex items-center justify-center text-white text-3xl hover:scale-105 hover:bg-teal-600 transition"
        >
          <i className="fas fa-heart"></i>
        </button>
      </div>
    </div>
  );
};