import React from 'react';
import { PawPrint, Home } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'adopter' | 'giver') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  return (
    <div className="h-full bg-white p-6 flex flex-col justify-center">
      <h2 className="text-3xl font-black text-gray-800 mb-2 text-center">¿Cuál es tu propósito?</h2>
      <p className="text-gray-500 text-center mb-10">Selecciona cómo quieres ayudar hoy</p>

      <div className="space-y-6">
        <button
          onClick={() => onSelectRole('adopter')}
          className="w-full bg-white border-2 border-orange-100 p-6 rounded-3xl shadow-lg hover:border-orange-500 hover:shadow-orange-100 transition-all group flex flex-col items-center gap-4 active:scale-95"
        >
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <Home size={32} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800">Quiero Adoptar</h3>
            <p className="text-sm text-gray-500 mt-1">Busco un nuevo integrante para mi familia</p>
          </div>
        </button>

        <div className="flex items-center gap-4 text-gray-300">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-sm font-medium">O</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <button
          onClick={() => onSelectRole('giver')}
          className="w-full bg-white border-2 border-teal-100 p-6 rounded-3xl shadow-lg hover:border-teal-500 hover:shadow-teal-100 transition-all group flex flex-col items-center gap-4 active:scale-95"
        >
          <div className="w-16 h-16 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors">
            <PawPrint size={32} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800">Dar en Adopción</h3>
            <p className="text-sm text-gray-500 mt-1">Busco un hogar responsable para una mascota</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;