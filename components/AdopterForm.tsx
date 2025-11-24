import React, { useState } from 'react';
import { Home, Users, CheckCircle, Upload, User } from 'lucide-react';
import { AdopterProfile } from '../types';

interface AdopterFormProps {
  onSubmit: (data: AdopterProfile) => void;
  onBack: () => void;
}

const AdopterForm: React.FC<AdopterFormProps> = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState<AdopterProfile>({
    name: '',
    profileImage: '',
    housingType: 'casa',
    ownership: 'propia',
    hasChildren: false,
    hasOtherPets: false,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, profileImage: imageUrl });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
        alert("Por favor ingresa tu nombre");
        return;
    }
    onSubmit(formData);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <button onClick={onBack} className="text-sm text-gray-400 font-bold mb-4">{'< VOLVER'}</button>
        <h2 className="text-2xl font-black text-gray-800">Tu Perfil</h2>
        <p className="text-sm text-gray-500">Cuéntanos sobre ti para el dueño de la mascota.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Foto y Nombre */}
        <section className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
                <div className="w-full h-full rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                    {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User size={48} className="text-gray-300" />
                    )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md hover:bg-orange-600 transition">
                    <Upload size={18} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
            </div>
            <div className="w-full">
                <label className="block text-sm font-bold text-gray-700 mb-2 text-center">Tu Nombre</label>
                <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej. María Perez"
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 text-center font-bold text-lg text-gray-900"
                />
            </div>
        </section>

        {/* Vivienda */}
        <section>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Home size={20} className="text-orange-500" /> Tu Hogar
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">¿Vives en Casa o Departamento?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, housingType: 'casa' })}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${formData.housingType === 'casa' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500'}`}
                >
                  Casa
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, housingType: 'departamento' })}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${formData.housingType === 'departamento' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500'}`}
                >
                  Depto
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Situación de la vivienda</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, ownership: 'propia' })}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${formData.ownership === 'propia' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500'}`}
                >
                  Propia
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, ownership: 'alquila' })}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${formData.ownership === 'alquila' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500'}`}
                >
                  Alquilo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Familia */}
        <section>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-orange-400" /> Familia
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50">
              <span className="text-gray-700 font-medium">¿Tienes niños en casa?</span>
              <div className="flex gap-2">
                <button
                   type="button"
                   onClick={() => setFormData({...formData, hasChildren: true})}
                   className={`px-4 py-2 rounded-lg text-sm font-bold transition ${formData.hasChildren ? 'bg-orange-500 text-white' : 'bg-white text-gray-400'}`}
                >
                  SÍ
                </button>
                <button
                   type="button"
                   onClick={() => setFormData({...formData, hasChildren: false})}
                   className={`px-4 py-2 rounded-lg text-sm font-bold transition ${!formData.hasChildren ? 'bg-orange-500 text-white' : 'bg-white text-gray-400'}`}
                >
                  NO
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50">
              <span className="text-gray-700 font-medium">¿Tienes otras mascotas?</span>
              <div className="flex gap-2">
                <button
                   type="button"
                   onClick={() => setFormData({...formData, hasOtherPets: true})}
                   className={`px-4 py-2 rounded-lg text-sm font-bold transition ${formData.hasOtherPets ? 'bg-orange-500 text-white' : 'bg-white text-gray-400'}`}
                >
                  SÍ
                </button>
                <button
                   type="button"
                   onClick={() => setFormData({...formData, hasOtherPets: false})}
                   className={`px-4 py-2 rounded-lg text-sm font-bold transition ${!formData.hasOtherPets ? 'bg-orange-500 text-white' : 'bg-white text-gray-400'}`}
                >
                  NO
                </button>
              </div>
            </div>
          </div>
        </section>

      </form>

      <div className="p-6 border-t border-gray-100">
        <button 
          onClick={handleSubmit}
          className="w-full py-4 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 transition flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          Guardar Perfil
        </button>
      </div>
    </div>
  );
};

export default AdopterForm;