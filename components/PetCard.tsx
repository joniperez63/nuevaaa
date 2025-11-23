import React, { useState, useRef, useEffect } from 'react';
import { Pet, Species } from '../types';

interface PetCardProps {
  pet: Pet;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  active: boolean;
  programmaticSwipe?: 'left' | 'right' | 'up' | null; // Allow parent to trigger swipe
}

export const PetCard: React.FC<PetCardProps> = ({ pet, onSwipe, active, programmaticSwipe }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Handle programmatic swipes (buttons)
  useEffect(() => {
    if (programmaticSwipe && active) {
      const xDir = programmaticSwipe === 'right' ? 500 : programmaticSwipe === 'left' ? -500 : 0;
      const yDir = programmaticSwipe === 'up' ? -500 : 0;
      const rotation = programmaticSwipe === 'right' ? 20 : programmaticSwipe === 'left' ? -20 : 0;
      
      setOffset({ x: xDir, y: yDir });
      
      // Allow animation to play then trigger callback
      setTimeout(() => {
        onSwipe(programmaticSwipe);
      }, 300);
    }
  }, [programmaticSwipe, active, onSwipe]);

  // Touch handlers for "swiping" feel
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!active || programmaticSwipe) return; // Disable touch if animating
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    (cardRef.current as any).startX = clientX;
    (cardRef.current as any).startY = clientY;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !active) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - ((cardRef.current as any).startX || 0);
    const deltaY = clientY - ((cardRef.current as any).startY || 0);
    
    setOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100; // px to trigger swipe
    
    if (offset.y < -threshold) {
       // Swipe Up (Super Like)
       onSwipe('up');
    } else if (offset.x > threshold) {
      onSwipe('right');
    } else if (offset.x < -threshold) {
      onSwipe('left');
    } else {
      setOffset({ x: 0, y: 0 }); // Reset
    }
  };

  // Rotation based on X offset
  const rotation = offset.x * 0.1;
  
  // Opacities for stamps
  const opacityNope = Math.min(Math.max(offset.x * -0.01, 0), 1);
  const opacityLike = Math.min(Math.max(offset.x * 0.01, 0), 1);
  const opacitySuper = Math.min(Math.max(offset.y * -0.01, 0), 1); // Opacity based on upward movement

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 w-full h-full p-4 flex flex-col justify-center items-center transition-transform duration-75 ease-linear ${(!isDragging && offset.x === 0 && offset.y === 0) ? 'transition-all duration-300' : ''} ${(programmaticSwipe) ? 'transition-all duration-300 ease-out' : ''}`}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
        zIndex: active ? 10 : 0,
        display: active ? 'flex' : 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden h-[75vh] border border-gray-200 select-none">
        
        {/* "STAMPS" overlays */}
        <div 
          className="absolute top-8 left-8 border-4 border-green-500 text-green-500 font-bold text-4xl px-4 py-2 rounded-xl transform -rotate-12 z-20"
          style={{ opacity: opacityLike }}
        >
          LIKE
        </div>
        <div 
          className="absolute top-8 right-8 border-4 border-red-500 text-red-500 font-bold text-4xl px-4 py-2 rounded-xl transform rotate-12 z-20"
          style={{ opacity: opacityNope }}
        >
          NOPE
        </div>
        <div 
          className="absolute bottom-32 left-0 right-0 mx-auto w-max border-4 border-blue-500 text-blue-500 font-bold text-3xl px-4 py-1 rounded-xl transform -rotate-6 z-20 bg-white/80"
          style={{ opacity: opacitySuper }}
        >
          SUPER MATCH
        </div>

        {/* Image */}
        <div className="h-3/4 w-full relative">
           <img 
            src={pet.imageUrl} 
            alt={pet.name} 
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>

        {/* Info */}
        <div className="h-1/4 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-gray-800">{pet.name}</h2>
              <span className="text-2xl text-gray-500 font-medium">{pet.age}</span>
            </div>
            <p className="text-gray-500 text-sm mb-1">
              <i className={`fas fa-${pet.species === Species.DOG ? 'dog' : 'cat'} mr-1`}></i>
              {pet.breed} • {pet.distance} km
            </p>
          </div>
          <p className="text-gray-600 line-clamp-2 text-sm">
            {pet.bio}
          </p>
        </div>
      </div>
    </div>
  );
};