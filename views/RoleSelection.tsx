import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Dog } from 'lucide-react';
import { Role } from '../types.ts';

interface RoleSelectionProps {
  onSelect: (role: Role) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 flex flex-col h-[75vh] justify-center items-center gap-6"
    >
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800">¿Qué deseas hacer hoy?</h2>
        <p className="text-gray-500 mt-2">Elige cómo quieres participar en Nueva Vida</p>
      </div>
      
      <button 
        onClick={() => onSelect('adopter')}
        className="w-full bg-white p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-orange-500 transition-all group active:scale-95"
      >
        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Heart className="text-orange-600 w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Quiero Adoptar</h3>
        <p className="text-gray-500 text-sm mt-2">Busco un compañero fiel para darle amor.</p>
      </button>

      <button 
        onClick={() => onSelect('giver')}
        className="w-full bg-white p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-green-500 transition-all group active:scale-95"
      >
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Dog className="text-green-600 w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Dar en Adopción</h3>
        <p className="text-gray-500 text-sm mt-2">Busco un hogar responsable para una mascota.</p>
      </button>
    </motion.div>
  );
};