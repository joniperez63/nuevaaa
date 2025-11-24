
import React from 'react';
import { X, Check } from 'lucide-react';

interface FilterModalProps {
  filters: {
    type: string | null; // 'dog', 'cat' or null
    ageRange: string | null; // 'puppy', 'adult' or null
  };
  onApply: (filters: { type: string | null; ageRange: string | null }) => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ filters, onApply, onClose }) => {
  const [localFilters, setLocalFilters] = React.useState(filters);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const toggleType = (type: string) => {
    setLocalFilters(prev => ({
      ...prev,
      type: prev.type === type ? null : type
    }));
  };

  const toggleAge = (range: string) => {
    setLocalFilters(prev => ({
      ...prev,
      ageRange: prev.ageRange === range ? null : range
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 relative pointer-events-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-800">Filtros</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Tipo de Mascota */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">¿Qué buscas?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => toggleType('dog')}
                className={`p-4 rounded-xl border-2 font-bold transition-all ${localFilters.type === 'dog' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500'}`}
              >
                Perros 🐶
              </button>
              <button
                onClick={() => toggleType('cat')}
                className={`p-4 rounded-xl border-2 font-bold transition-all ${localFilters.type === 'cat' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500'}`}
              >
                Gatos 🐱
              </button>
            </div>
          </div>

          {/* Edad */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Edad</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => toggleAge('puppy')}
                className={`p-4 rounded-xl border-2 font-bold transition-all ${localFilters.ageRange === 'puppy' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500'}`}
              >
                Cachorros 🍼
              </button>
              <button
                onClick={() => toggleAge('adult')}
                className={`p-4 rounded-xl border-2 font-bold transition-all ${localFilters.ageRange === 'adult' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500'}`}
              >
                Adultos 🐾
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleApply}
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
