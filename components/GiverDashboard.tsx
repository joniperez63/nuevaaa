import React, { useState } from 'react';
import { Pet, Species } from '../types';

interface GiverDashboardProps {
  userName: string;
}

export const GiverDashboard: React.FC<GiverDashboardProps> = ({ userName }) => {
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [petName, setPetName] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petSpecies, setPetSpecies] = useState<Species>(Species.DOG);
  const [petBreed, setPetBreed] = useState('');
  const [petBio, setPetBio] = useState('');

  const handleAddPet = () => {
    if (!petName || !petBreed) return;

    const newPet: Pet = {
      id: Date.now().toString(),
      name: petName,
      age: parseInt(petAge) || 1,
      species: petSpecies,
      breed: petBreed,
      bio: petBio || 'Busco un hogar amoroso.',
      personality: 'Amigable y juguetón', // Default for user created
      imageUrl: petSpecies === Species.DOG 
        ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80' 
        : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      distance: 0
    };

    setMyPets([...myPets, newPet]);
    setShowForm(false);
    
    // Reset form
    setPetName('');
    setPetAge('');
    setPetBio('');
    setPetBreed('');
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="h-16 bg-white flex items-center justify-between px-6 shadow-sm z-10">
        <div>
           <h1 className="text-xl font-bold text-gray-800">Panel de Adopción</h1>
           <p className="text-xs text-gray-500">Hola, {userName}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
           <i className="fas fa-user"></i>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!showForm ? (
          <>
            {/* Empty State or List */}
            {myPets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 mt-8 bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-paw text-2xl text-blue-400"></i>
                </div>
                <h3 className="font-bold text-gray-700 mb-2">No tienes mascotas publicadas</h3>
                <p className="text-gray-500 text-sm mb-6">Ayuda a una mascota a encontrar su nueva familia en Mendoza.</p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-full font-bold shadow-lg hover:bg-blue-600 transition"
                >
                  <i className="fas fa-plus mr-2"></i> Publicar Mascota
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-gray-700">Mis Mascotas ({myPets.length})</h2>
                    <button onClick={() => setShowForm(true)} className="text-sm text-blue-500 font-bold">
                      + Agregar otra
                    </button>
                 </div>
                 {myPets.map(pet => (
                   <div key={pet.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center">
                      <img src={pet.imageUrl} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                           <h3 className="font-bold text-lg">{pet.name}</h3>
                           <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Visible</span>
                        </div>
                        <p className="text-sm text-gray-500">{pet.breed} • {pet.age} años</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-400">
                           <span><i className="fas fa-eye mr-1"></i> 12 Vistas</span>
                           <span><i className="fas fa-heart mr-1"></i> 3 Likes</span>
                        </div>
                      </div>
                   </div>
                 ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold">Nueva Mascota</h2>
               <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                 <i className="fas fa-times text-xl"></i>
               </button>
             </div>

             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                 <input 
                    type="text" 
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="Ej. Toby"
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Especie</label>
                    <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
                       <button 
                        onClick={() => setPetSpecies(Species.DOG)}
                        className={`flex-1 py-2 rounded-md text-sm font-bold ${petSpecies === Species.DOG ? 'bg-white shadow text-blue-500' : 'text-gray-400'}`}
                       >
                         Perro
                       </button>
                       <button 
                        onClick={() => setPetSpecies(Species.CAT)}
                        className={`flex-1 py-2 rounded-md text-sm font-bold ${petSpecies === Species.CAT ? 'bg-white shadow text-blue-500' : 'text-gray-400'}`}
                       >
                         Gato
                       </button>
                    </div>
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Edad (años)</label>
                     <input 
                        type="number" 
                        value={petAge}
                        onChange={(e) => setPetAge(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                        placeholder="Ej. 2"
                     />
                  </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Raza</label>
                 <input 
                    type="text" 
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="Ej. Caniche, Mestizo..."
                 />
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Biografía</label>
                 <textarea 
                    value={petBio}
                    onChange={(e) => setPetBio(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500 h-24 resize-none"
                    placeholder="Cuenta un poco sobre su personalidad..."
                 />
               </div>

               <button 
                 onClick={handleAddPet}
                 className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-600 transition mt-2"
               >
                 Publicar Mascota
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};