import React from 'react';
import { Match } from '../types';
import { MessageCircle, LogOut } from 'lucide-react';
import AdBanner from './AdBanner';

interface MatchesViewProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  onBack: () => void;
  title?: string;
}

const MatchesView: React.FC<MatchesViewProps> = ({ matches, onSelectMatch, onBack, title = "Tus Matches" }) => {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
           <button onClick={onBack} className="text-sm font-bold text-gray-500 hover:text-black">
              VOLVER
           </button>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sin Chats Activos</h2>
          <p className="text-gray-500 mb-6">Cuando ambos acepten la conexión, podrán chatear aquí.</p>
        </div>
        <AdBanner />
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white relative z-50">
         <button onClick={onBack} className="text-sm font-bold text-gray-500 hover:text-black">
            VOLVER
         </button>
         <h2 className="text-xl font-black text-gray-800 flex-1 text-center">{title}</h2>
         <div className="w-10"></div> {/* Spacer for center alignment */}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 divide-y divide-gray-50">
          {matches.map((match) => (
            <button 
              key={match.id} 
              onClick={() => onSelectMatch(match)}
              className="flex items-center p-4 hover:bg-gray-50 transition w-full text-left"
            >
              <div className="relative">
                <img 
                  src={match.image} 
                  alt={match.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                />
                {/* Online indicator mock */}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-800 text-lg">{match.name}</h3>
                  <span className="text-xs text-gray-400">Ahora</span>
                </div>
                <p className="text-sm text-gray-500 truncate pr-4">
                  {match.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <AdBanner />
    </div>
  );
};

export default MatchesView;