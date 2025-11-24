import React from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Pet } from '../types.ts';

interface PetCardProps {
  pet: Pet;
  onSwipe: (direction: 'left' | 'right') => void;
}

export const PetCard: React.FC<PetCardProps> = ({ pet, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div 
      className="w-full max-w-sm h-[60vh] bg-white rounded-2xl shadow-xl overflow-hidden relative cursor-grab active:cursor-grabbing touch-none select-none"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.1, opacity: 0 }}
      whileTap={{ cursor: "grabbing" }}
    >
      <img 
        src={pet.photoUrl || "https://picsum.photos/400/600"} 
        alt={pet.name} 
        className="w-full h-full object-cover pointer-events-none" 
      />
      
      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 text-white pointer-events-none">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold">{pet.name}</h2>
            <div className="flex items-center gap-1 text-sm font-medium mt-1">
              <MapPin size={16} className="text-orange-400" />
              <span>{pet.distance} km de distancia</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3 flex-wrap">
          {pet.castrated && (
            <span className="px-3 py-1 bg-green-500/30 border border-green-500/60 backdrop-blur-sm rounded-full text-xs font-bold text-green-100">
              Castrado
            </span>
          )}
          {pet.vaccinated && (
            <span className="px-3 py-1 bg-blue-500/30 border border-blue-500/60 backdrop-blur-sm rounded-full text-xs font-bold text-blue-100">
              Vacunado
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};