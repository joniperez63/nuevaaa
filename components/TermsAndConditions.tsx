import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

interface TermsAndConditionsProps {
  onAccept: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onAccept }) => {
  return (
    <div className="flex flex-col h-full bg-white p-6 overflow-y-auto">
      <div className="flex flex-col items-center mt-8 mb-6">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <Heart size={40} className="text-orange-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-800 text-center">Nueva Vida Mendoza</h1>
        <p className="text-sm text-gray-500 font-medium">Conectando corazones</p>
      </div>

      <div className="flex-1 bg-gray-50 rounded-2xl p-6 shadow-inner border border-gray-100 mb-6 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ShieldCheck size={20} className="text-emerald-500" />
          Bases y Condiciones
        </h2>
        
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed text-justify">
          <p>
            Bienvenido a <strong>Nueva Vida Mendoza</strong>. Antes de continuar, es fundamental que leas y aceptes los siguientes términos:
          </p>
          
          <p>
            1. <strong>Iniciativa Sin Fines de Lucro:</strong> Esta aplicación ha sido desarrollada exclusivamente con fines solidarios, buscando facilitar el encuentro entre animales que necesitan un hogar y personas dispuestas a brindarlo. No existe ningún interés comercial detrás de esta plataforma.
          </p>
          
          <p>
            2. <strong>Exención de Responsabilidad:</strong> "Nueva Vida Mendoza" y sus desarrolladores actúan únicamente como un medio de conexión. <strong>No nos hacemos responsables</strong> por el estado de salud, comportamiento o veracidad de la información de las mascotas publicadas, ni por la idoneidad de los adoptantes.
          </p>
          
          <p>
            3. <strong>Responsabilidad de los Usuarios:</strong> Cualquier acuerdo, entrega, traslado o seguimiento de la adopción es responsabilidad exclusiva de las partes involucradas (adoptante y dador). Recomendamos tomar todas las precauciones necesarias al momento de concretar el encuentro.
          </p>
          
          <p>
            4. <strong>Compromiso de Bienestar:</strong> El único propósito permitido en esta app es dar una nueva vida llena de amor y respeto a los animales. Queda terminantemente prohibido el uso de la plataforma para venta de animales, cruza o cualquier actividad que atente contra su bienestar.
          </p>
        </div>
      </div>

      <button
        onClick={onAccept}
        className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95"
      >
        He leído y acepto los términos
      </button>
    </div>
  );
};

export default TermsAndConditions;