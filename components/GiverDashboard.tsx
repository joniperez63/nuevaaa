import React, { useState, useRef } from 'react';
import { Pet, Species } from '../types';
import { savePetToDB, uploadPetImage, db } from '../services/firebase';

interface GiverDashboardProps {
  userName: string;
}

export const GiverDashboard: React.FC<GiverDashboardProps> = ({ userName }) => {
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [petName, setPetName] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petSpecies, setPetSpecies] = useState<Species>(Species.DOG);
  const [petBreed, setPetBreed] = useState('');
  const [petBio, setPetBio] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddPet = async () => {
    if (!petName || !petBreed) return;

    setIsUploading(true);

    try {
      let imageUrl = petSpecies === Species.DOG 
        ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80' 
        : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80';

      // 1. Subir imagen a Firebase si existe
      if (imageFile && db) {
        imageUrl = await uploadPetImage(imageFile);
      }

      const newPet: Pet = {
        id: Date.now().toString(), // Temporal ID until DB confirm
        name: petName,
        age: parseInt(petAge) || 1,
        species: petSpecies,
        breed: petBreed,
        bio: petBio || 'Busco un hogar amoroso.',
        personality: 'Amigable y juguetón', 
        imageUrl: imageUrl,
        distance: 0
      };

      // 2. Guardar en Base de Datos Real
      if (db) {
        await savePetToDB(newPet);
        alert("¡Mascota publicada en la nube exitosamente!");
      } else {
        // Fallback local
        console.log("Guardando localmente (Sin Firebase)");
      }

      setMyPets([...myPets, newPet]);
      setShowForm(false);
      resetForm();

    } catch (error) {
      console.error("Error al publicar:", error);
      alert("Hubo un error al subir la mascota. Revisa tu conexión.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setPetName('');
    setPetAge('');
    setPetBio('');
    setPetBreed('');
    setImageFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="h-16 bg-white flex items-center justify-between px-6 shadow-sm z-10">
        <div>
           <h1 className="text-xl font-bold text-gray-800">Panel de Adopción</h1>
           <p className="text-xs text-gray-500">Hola, {userName}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
           <i className="fas fa-user"></i>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!db && (
           <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
             <div className="flex">
               <div className="flex-shrink-0">
                 <i className="fas fa-exclamation-triangle text-yellow-400"></i>
               </div>
               <div className="ml-3">
                 <p className="text-sm text-yellow-700">
                   Modo Demo: Configura Firebase en Vercel para guardar datos reales.
                 </p>
               </div>
             </div>
           </div>
        )}

        {!showForm ? (
          <>
            {/* Empty State or List */}
            {myPets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 mt-8 bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-paw text-2xl text-orange-400"></i>
                </div>
                <h3 className="font-bold text-gray-700 mb-2">No tienes mascotas publicadas</h3>
                <p className="text-gray-500 text-sm mb-6">Ayuda a una mascota a encontrar su nueva familia en Mendoza.</p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold shadow-lg hover:bg-orange-600 transition"
                >
                  <i className="fas fa-plus mr-2"></i> Publicar Mascota
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-gray-700">Mis Mascotas ({myPets.length})</h2>
                    <button onClick={() => setShowForm(true)} className="text-sm text-orange-500 font-bold">
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
                           <span><i className="fas fa-eye mr-1"></i> 0 Vistas</span>
                        </div>
                      </div>
                   </div>
                 ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in pb-20">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold">Nueva Mascota</h2>
               <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                 <i className="fas fa-times text-xl"></i>
               </button>
             </div>

             <div className="space-y-4">
               {/* Image Upload */}
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="w-full h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition relative overflow-hidden"
               >
                 {previewUrl ? (
                   <img src={previewUrl} className="w-full h-full object-cover" />
                 ) : (
                   <>
                     <i className="fas fa-camera text-3xl text-gray-400 mb-2"></i>
                     <span className="text-sm text-gray-500">Toca para subir foto</span>
                   </>
                 )}
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleImageSelect} 
                   accept="image/*" 
                   className="hidden" 
                 />
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                 <input 
                    type="text" 
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                    placeholder="Ej. Toby"
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Especie</label>
                    <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
                       <button 
                        onClick={() => setPetSpecies(Species.DOG)}
                        className={`flex-1 py-2 rounded-md text-sm font-bold ${petSpecies === Species.DOG ? 'bg-white shadow text-orange-500' : 'text-gray-400'}`}
                       >
                         Perro
                       </button>
                       <button 
                        onClick={() => setPetSpecies(Species.CAT)}
                        className={`flex-1 py-2 rounded-md text-sm font-bold ${petSpecies === Species.CAT ? 'bg-white shadow text-orange-500' : 'text-gray-400'}`}
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
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                    placeholder="Ej. Caniche, Mestizo..."
                 />
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Biografía</label>
                 <textarea 
                    value={petBio}
                    onChange={(e) => setPetBio(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-orange-500 h-24 resize-none"
                    placeholder="Cuenta un poco sobre su personalidad..."
                 />
               </div>

               <button 
                 onClick={handleAddPet}
                 disabled={isUploading}
                 className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition mt-2 ${isUploading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}
               >
                 {isUploading ? 'Subiendo...' : 'Publicar Mascota'}
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};