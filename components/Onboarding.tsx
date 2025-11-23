import React, { useState } from 'react';
import { UserPreferences, Species, UserRole } from '../types';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0 is Terms, 1 is Role
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  
  // Adopter specific fields
  const [pref, setPref] = useState<Species | 'BOTH'>('BOTH');
  const [housingType, setHousingType] = useState<'HOUSE' | 'APARTMENT' | null>(null);
  const [ownership, setOwnership] = useState<'OWNED' | 'RENTED' | null>(null);
  const [hasYard, setHasYard] = useState<boolean | null>(null);
  const [hasKids, setHasKids] = useState<boolean | null>(null);

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1 && role) {
      setStep(2);
    } else if (step === 2 && name) {
      if (role === 'GIVER') {
        // Givers skip adoption questions
        onComplete({
          name,
          role,
          preferredSpecies: 'BOTH',
          maxDistance: 50
        });
      } else {
        setStep(3); // Go to housing questions
      }
    } else if (step === 3) {
      // Validate housing questions
      if (housingType && ownership && hasYard !== null && hasKids !== null) {
        setStep(4); // Go to preferences
      }
    } else if (step === 4) {
      onComplete({
        name,
        role: role as UserRole,
        preferredSpecies: pref,
        maxDistance: 50,
        housingType: housingType!,
        ownership: ownership!,
        hasYard: hasYard!,
        hasKids: hasKids!
      });
    }
  };

  const isHousingComplete = housingType && ownership && hasYard !== null && hasKids !== null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-400 to-teal-600 text-white overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-20 h-20 bg-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg transform -rotate-6">
            <i className="fas fa-paw text-4xl text-orange-500"></i>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Vida</h1>
          <p className="opacity-90 text-sm font-medium tracking-wide">ADOPCIÓN RESPONSABLE • MENDOZA</p>
        </div>

        {/* STEP 0: TERMS AND CONDITIONS */}
        {step === 0 && (
          <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-xl animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Bienvenido/a</h2>
            <div className="h-64 overflow-y-auto text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="font-bold mb-2">Términos y Condiciones de Uso</p>
              <p className="mb-2">1. <strong>Objeto:</strong> "Nueva Vida" es una plataforma intermediaria gratuita para facilitar la adopción de mascotas en la provincia de Mendoza.</p>
              <p className="mb-2">2. <strong>Responsabilidad:</strong> La aplicación no se hace responsable por la salud, comportamiento o veracidad de la información de las mascotas publicadas, ni por la idoneidad de los adoptantes.</p>
              <p className="mb-2">3. <strong>Uso de Datos:</strong> Al utilizar esta app, aceptas compartir la información provista con otros usuarios con el único fin de concretar adopciones.</p>
              <p className="mb-2">4. <strong>Compromiso:</strong> Te comprometes a tratar a los animales con respeto y a utilizar la plataforma de buena fe. El maltrato animal es un delito penado por la ley.</p>
              <p className="mb-2">5. <strong>Gratuidad:</strong> Queda prohibida la venta de animales a través de esta plataforma.</p>
            </div>
            <button 
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-bold bg-teal-600 text-white shadow-lg hover:bg-teal-700 transition transform active:scale-95"
            >
              Acepto los Términos
            </button>
          </div>
        )}

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 && (
          <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-xl animate-fade-in">
            <label className="block text-lg font-bold mb-6 text-center text-gray-700">¿Cuál es tu objetivo?</label>
            <div className="space-y-4">
              <button 
                onClick={() => setRole('ADOPTER')}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition ${role === 'ADOPTER' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:bg-gray-50'}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${role === 'ADOPTER' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <i className="fas fa-heart"></i>
                </div>
                <div className="text-left">
                  <span className="block font-bold text-lg">Quiero Adoptar</span>
                  <span className="text-xs text-gray-500">Busco un compañero de vida</span>
                </div>
              </button>

              <button 
                onClick={() => setRole('GIVER')}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition ${role === 'GIVER' ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:bg-gray-50'}`}
              >
                 <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${role === 'GIVER' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <i className="fas fa-hand-holding-heart"></i>
                </div>
                <div className="text-left">
                  <span className="block font-bold text-lg">Dar en Adopción</span>
                  <span className="text-xs text-gray-500">Busco hogar para una mascota</span>
                </div>
              </button>
            </div>
            <button 
              onClick={handleNext}
              disabled={!role}
              className={`w-full mt-8 py-4 rounded-2xl font-bold transition transform active:scale-95 ${role ? 'bg-gray-800 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}
            >
              Continuar
            </button>
          </div>
        )}

        {/* STEP 2: NAME */}
        {step === 2 && (
          <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-xl animate-fade-in">
            <label className="block text-lg font-bold mb-4 text-gray-700">¿Cómo te llamas?</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 focus:border-orange-400 rounded-xl px-4 py-4 text-xl outline-none transition"
              placeholder="Tu nombre o apodo"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-3 ml-1">
              {role === 'ADOPTER' ? 'Así te presentaremos a las mascotas.' : 'Así aparecerás como contacto.'}
            </p>
            <button 
              onClick={handleNext}
              disabled={!name}
              className={`w-full mt-8 py-4 rounded-2xl font-bold transition transform active:scale-95 ${name ? 'bg-gray-800 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* STEP 3: HOUSING QUESTIONS (Adopter Only) */}
        {step === 3 && role === 'ADOPTER' && (
          <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-xl animate-fade-in max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <i className="fas fa-home text-orange-500"></i>
              <h2 className="text-lg font-bold text-gray-800">Tu Hogar</h2>
            </div>
            
            <div className="space-y-5">
              
              {/* Type */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tipo de vivienda</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setHousingType('HOUSE')}
                    className={`py-3 rounded-xl border-2 font-medium text-sm transition ${housingType === 'HOUSE' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500'}`}
                  >
                    <i className="fas fa-home mr-2"></i>Casa
                  </button>
                  <button 
                    onClick={() => setHousingType('APARTMENT')}
                    className={`py-3 rounded-xl border-2 font-medium text-sm transition ${housingType === 'APARTMENT' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500'}`}
                  >
                    <i className="fas fa-building mr-2"></i>Depto
                  </button>
                </div>
              </div>

              {/* Ownership */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Situación</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setOwnership('OWNED')}
                    className={`py-3 rounded-xl border-2 font-medium text-sm transition ${ownership === 'OWNED' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500'}`}
                  >
                    Propia
                  </button>
                  <button 
                    onClick={() => setOwnership('RENTED')}
                    className={`py-3 rounded-xl border-2 font-medium text-sm transition ${ownership === 'RENTED' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500'}`}
                  >
                    Alquiler
                  </button>
                </div>
              </div>

              {/* Yard */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">¿Tienes patio cerrado?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setHasYard(true)}
                    className={`py-3 rounded-xl border-2 font-medium text-sm transition ${hasYard === true ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-100 text-gray-500'}`}
                  >
                    Sí
                  </button>
                  <button 
                    onClick={() => setHasYard(false)}
                    className={`py-3 rounded-xl border-2 font-medium text-sm transition ${hasYard === false ? 'border-gray-400 bg-gray-100 text-gray-600' : 'border-gray-100 text-gray-500'}`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Kids */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">¿Viven niños pequeños?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setHasKids(true)}
                    className={`py-3 rounded-xl border-2 font-medium text-sm transition ${hasKids === true ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-500'}`}
                  >
                    Sí
                  </button>
                  <button 
                    onClick={() => setHasKids(false)}
                    className={`py-3 rounded-xl border-2 font-medium text-sm transition ${hasKids === false ? 'border-gray-400 bg-gray-100 text-gray-600' : 'border-gray-100 text-gray-500'}`}
                  >
                    No
                  </button>
                </div>
              </div>

            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-3">
              <i className="fas fa-lock text-yellow-600 mt-1"></i>
              <p className="text-xs text-yellow-700 leading-tight">
                <strong>Privacidad:</strong> Estos datos se utilizan <u>únicamente</u> para que la persona que da en adopción sepa si el hogar es adecuado para la mascota. No se hacen públicos.
              </p>
            </div>

            <button 
              onClick={handleNext}
              disabled={!isHousingComplete}
              className={`w-full mt-6 py-4 rounded-2xl font-bold transition transform active:scale-95 ${isHousingComplete ? 'bg-gray-800 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* STEP 4: PREFERENCES (Adopter Only) */}
        {step === 4 && role === 'ADOPTER' && (
          <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-xl animate-fade-in">
             <label className="block text-lg font-bold mb-6 text-center text-gray-700">¿Qué buscas adoptar?</label>
             <div className="grid grid-cols-3 gap-3 mb-6">
                <button 
                  onClick={() => setPref(Species.DOG)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center transition ${pref === Species.DOG ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <i className="fas fa-dog text-3xl mb-2"></i>
                  <span className="text-sm font-bold">Perros</span>
                </button>
                <button 
                  onClick={() => setPref(Species.CAT)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center transition ${pref === Species.CAT ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <i className="fas fa-cat text-3xl mb-2"></i>
                  <span className="text-sm font-bold">Gatos</span>
                </button>
                <button 
                  onClick={() => setPref('BOTH')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center transition ${pref === 'BOTH' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <i className="fas fa-heart text-3xl mb-2"></i>
                  <span className="text-sm font-bold">Ambos</span>
                </button>
             </div>
             <button 
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-bold bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition transform active:scale-95"
            >
              ¡Buscar Nueva Vida!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};