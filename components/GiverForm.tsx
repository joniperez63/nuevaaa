import React, { useState } from 'react';
import { Camera, Syringe, FileText, CheckCircle, Upload, PlusCircle } from 'lucide-react';
import { Pet } from '../types';

interface GiverFormProps {
  onSubmit: (pet: Pet, addAnother: boolean) => void;
  onBack: () => void;
}

const GiverForm: React.FC<GiverFormProps> = ({ onSubmit, onBack }) => {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [ageUnit, setAgeUnit] = useState<'years' | 'months'>('years');
  const [bio, setBio] = useState('');
  const [isNeutered, setIsNeutered] = useState(false);
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Convert to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
          if (reader.result && images.length < 3) {
             setImages([...images, reader.result as string]);
          }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent, addAnother: boolean) => {
    e.preventDefault();
    if (!name || images.length === 0) {
      alert("Por favor completa el nombre y sube al menos una foto.");
      return;
    }
    
    setIsLoading(true);

    try {
        let numericAge = parseFloat(age);
        if (isNaN(numericAge)) numericAge = 0;

        if (ageUnit === 'months') {
            numericAge = parseFloat((numericAge / 12).toFixed(2));
        }

        const tags = [];
        if (isNeutered) tags.push('Castrado');
        if (isVaccinated) tags.push('Vacunado');
        tags.push(numericAge < 1 ? 'Cachorro' : 'Adulto');

        const newPet: Pet = {
        id: Date.now().toString(), // Temp ID, DB will generate real one or overwrite
        name,
        age: numericAge,
        breed: breed || 'Mestizo',
        image: images[0],
        images: images,
        bio,
        personality: 'Friendly',
        distance: 0,
        tags
        };

        await onSubmit(newPet, addAnother);

        if (addAnother) {
            setName('');
            setBreed('');
            setAge('');
            setAgeUnit('years');
            setBio('');
            setIsNeutered(false);
            setIsVaccinated(false);
            setImages([]);
            const formContainer = document.querySelector('.form-container');
            if (formContainer) formContainer.scrollTop = 0;
        }
    } catch(err) {
        console.error(err);
        alert("Error al subir. La imagen puede ser muy pesada.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <button onClick={onBack} className="text-sm text-gray-400 font-bold mb-4">{'< VOLVER'}</button>
        <h2 className="text-2xl font-black text-gray-800">Publicar Mascota</h2>
        <p className="text-sm text-gray-500">Dale una nueva oportunidad a un peludo.</p>
      </div>

      <form className="form-container flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Fotos */}
        <section>
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
             <Camera size={18} /> Fotos (Sube 3 fotos)
          </label>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="flex-shrink-0 w-24 h-32 relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                {images[idx] ? (
                  <img src={images[idx]} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition">
                    <Upload size={20} className="text-gray-400 mb-1" />
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Foto {idx + 1}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Datos Básicos */}
        <section className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la mascota</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-200 text-gray-900"
              placeholder="Ej. Rex"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raza / Tipo</label>
                <input 
                type="text" 
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-200 text-gray-900"
                placeholder="Ej. Mestizo"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                <div className="flex rounded-xl bg-gray-50 border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-teal-200 focus-within:border-teal-200">
                    <input 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-3 bg-transparent focus:outline-none text-gray-900 min-w-0"
                    placeholder="Ej. 2"
                    />
                    <div className="flex border-l border-gray-200">
                        <button 
                            type="button"
                            onClick={() => setAgeUnit('months')} 
                            className={`px-3 text-xs font-bold transition-colors ${ageUnit === 'months' ? 'bg-teal-100 text-teal-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            Meses
                        </button>
                        <button 
                            type="button"
                            onClick={() => setAgeUnit('years')}
                            className={`px-3 text-xs font-bold border-l border-gray-200 transition-colors ${ageUnit === 'years' ? 'bg-teal-100 text-teal-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            Años
                        </button>
                    </div>
                </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FileText size={16} /> Descripción
            </label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-200 resize-none text-gray-900"
              placeholder="Cuenta su historia, personalidad, y por qué busca hogar..."
            />
          </div>
        </section>

        {/* Salud */}
        <section>
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
             <Syringe size={18} /> Estado de Salud
          </label>
          <div className="grid grid-cols-2 gap-4">
             <label className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${isNeutered ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${isNeutered ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                    {isNeutered && <CheckCircle size={14} className="text-white" />}
                </div>
                <input type="checkbox" checked={isNeutered} onChange={(e) => setIsNeutered(e.target.checked)} className="hidden" />
                <span className={`text-sm font-medium ${isNeutered ? 'text-emerald-700' : 'text-gray-500'}`}>Castrado</span>
             </label>

             <label className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${isVaccinated ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${isVaccinated ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                    {isVaccinated && <CheckCircle size={14} className="text-white" />}
                </div>
                <input type="checkbox" checked={isVaccinated} onChange={(e) => setIsVaccinated(e.target.checked)} className="hidden" />
                <span className={`text-sm font-medium ${isVaccinated ? 'text-emerald-700' : 'text-gray-500'}`}>Vacunas al día</span>
             </label>
          </div>
        </section>

      </form>

      <div className="p-6 border-t border-gray-100 flex flex-col gap-3">
        <button 
          disabled={isLoading}
          onClick={(e) => handleFormSubmit(e, true)}
          className="w-full py-3 bg-white border-2 border-teal-500 text-teal-500 font-bold rounded-full shadow-sm hover:bg-teal-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? 'Subiendo...' : (
             <>
               <PlusCircle size={20} />
               Guardar y Agregar Otra
             </>
          )}
        </button>
        <button 
          disabled={isLoading}
          onClick={(e) => handleFormSubmit(e, false)}
          className="w-full py-4 bg-teal-500 text-white font-bold rounded-full shadow-lg hover:bg-teal-600 transition disabled:opacity-50"
        >
          {isLoading ? 'Publicando...' : 'Finalizar y Publicar'}
        </button>
      </div>
    </div>
  );
};

export default GiverForm;