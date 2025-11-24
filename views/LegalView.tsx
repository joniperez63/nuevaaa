import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface LegalViewProps {
  onBack: () => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="p-4 border-b flex items-center gap-3 sticky top-0 bg-white z-10 shadow-sm">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft />
        </button>
        <h2 className="font-bold text-lg text-gray-800">Términos y Condiciones</h2>
      </div>
      <div className="p-6 text-gray-600 space-y-4 pb-32 text-justify">
        <h3 className="font-bold text-gray-800 text-lg">Responsabilidad</h3>
        <p>
          Nueva Vida Mendoza es una plataforma de conexión libre y gratuita. No somos un refugio ni intermediarios en las adopciones. 
        </p>
        <p>
          No nos hacemos responsables por el estado de salud de los animales, la veracidad de la información proporcionada 
          por los usuarios, ni por cualquier incidente, daño o perjuicio que pueda surgir de los encuentros o adopciones 
          concertadas a través de esta aplicación.
        </p>
        
        <h3 className="font-bold text-gray-800 text-lg">Seguridad</h3>
        <p>
            Recomendamos encarecidamente no realizar transferencias de dinero por adelantado bajo ningún concepto (costos de envío, vacunas, etc.).
        </p>

        <p>El usuario asume total responsabilidad por sus interacciones.</p>
        
        <div className="mt-12 text-center">
            <p className="text-xs text-gray-400">Versión 1.0.0</p>
            <p className="text-xs text-gray-400 mt-1">Hecho con ❤️ en Mendoza 🍷</p>
        </div>
      </div>
    </div>
  );
};