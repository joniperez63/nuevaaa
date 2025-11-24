import React from 'react';
import { Instagram, ShoppingBag } from 'lucide-react';

const AdBanner: React.FC = () => {
  return (
    <a
      href="https://www.instagram.com/alba.jazmin.tienda?igsh=MTc1NTBldzM1dHN5bA=="
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full bg-white border-t border-gray-100 shadow-lg relative z-50 group"
    >
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600"></div>
      <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
               <ShoppingBag size={18} className="text-pink-600" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-gray-800 leading-tight">Tienda Alba Jazmin</span>
            <span className="text-[10px] font-semibold text-gray-500">Sublimaciones y ropa DTF</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full group-hover:bg-purple-100 transition">
          <Instagram size={14} />
          <span className="text-[10px] font-bold">Ver Perfil</span>
        </div>
      </div>
    </a>
  );
};

export default AdBanner;