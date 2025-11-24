import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Info } from 'lucide-react';
import { Button, Input, Checkbox } from '../components/UI.tsx';
import { Role, UserProfile } from '../types.ts';

interface ProfileFormProps {
  role: Role;
  onSave: (data: Partial<UserProfile>) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ role, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: null as { lat: number; lng: number } | null,
    housingType: '',
    hasKids: false,
    hasPets: false
  });
  const [locating, setLocating] = useState(false);

  const getLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }));
        setLocating(false);
      }, (error) => {
        alert("Necesitamos tu ubicación para mostrarte mascotas cercanas.");
        setLocating(false);
      });
    } else {
      alert("Geolocalización no soportada por este navegador.");
      setLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      alert("Por favor completa nombre y ubicación.");
      return;
    }
    // Cast to correct type since validation ensures location is present
    onSave({
      ...formData,
      location: formData.location!,
      role
    } as unknown as Partial<UserProfile>);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="p-6 pb-32"
    >
      <h2 className="text-2xl font-bold mb-6 text-orange-600">
        {role === 'adopter' ? 'Perfil de Adoptante' : 'Perfil de Dador'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Tu Nombre Completo" 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          placeholder="Ej: Juan Pérez"
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <Button 
            onClick={getLocation} 
            variant={formData.location ? 'secondary' : 'outline'} 
            className="w-full"
            disabled={locating}
            type="button"
          >
            <MapPin size={18} />
            {locating ? 'Obteniendo...' : (formData.location ? 'Ubicación Guardada' : 'Usar mi ubicación actual')}
          </Button>
          {role === 'adopter' && <p className="text-xs text-gray-500 mt-1 ml-1">Usaremos esto para calcular la distancia con las mascotas.</p>}
        </div>

        {role === 'adopter' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Alquilas o Casa Propia?</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={formData.housingType}
                onChange={e => setFormData({...formData, housingType: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                <option value="own">Casa Propia</option>
                <option value="rent">Alquiler</option>
              </select>
            </div>
            <Checkbox 
              label="¿Tienes niños en casa?" 
              checked={formData.hasKids} 
              onChange={val => setFormData({...formData, hasKids: val})}
            />
            <Checkbox 
              label="¿Tienes otras mascotas?" 
              checked={formData.hasPets} 
              onChange={val => setFormData({...formData, hasPets: val})}
            />
            <div className="bg-blue-50 p-3 rounded-lg flex gap-2 items-start mt-4 border border-blue-100">
              <Info className="text-blue-500 shrink-0 w-5 h-5 mt-0.5" />
              <p className="text-xs text-blue-700">
                Esta información solo será visible para el dueño de la mascota si muestras interés.
              </p>
            </div>
          </>
        )}

        <Button type="submit" variant="primary" className="w-full mt-6 shadow-lg shadow-orange-200">
          Guardar y Continuar
        </Button>
      </form>
    </motion.div>
  );
};