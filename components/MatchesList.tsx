import React from 'react';
import { Match } from '../types';

interface MatchesListProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
}

export const MatchesList: React.FC<MatchesListProps> = ({ matches, onSelectMatch }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-4">
        <h1 className="text-teal-600 font-bold text-xl mb-4">Nuevos Matches</h1>
        <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
          {matches.length === 0 && (
            <p className="text-gray-400 text-sm italic">Desliza tarjetas para hacer match</p>
          )}
          {matches.map((match) => (
            <div key={match.pet.id} onClick={() => onSelectMatch(match)} className="flex flex-col items-center flex-shrink-0 w-20 cursor-pointer group">
              <div className={`w-16 h-16 rounded-2xl p-0.5 ${match.isSuperLike ? 'bg-gradient-to-tr from-blue-400 to-blue-600' : 'bg-gradient-to-tr from-orange-400 to-teal-600'} transition-transform group-hover:scale-105`}>
                 <img src={match.pet.imageUrl} className="w-full h-full rounded-2xl border-2 border-white object-cover" />
              </div>
              <div className="flex items-center justify-center gap-1 mt-1 w-full">
                 {match.isSuperLike && <i className="fas fa-star text-[10px] text-blue-500"></i>}
                 <span className={`text-xs font-bold truncate ${match.isSuperLike ? 'text-blue-600' : 'text-gray-700'}`}>{match.pet.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 border-t px-4 pt-4 overflow-y-auto">
        <h2 className="text-gray-800 font-bold text-lg mb-3">Mensajes</h2>
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <i className="fas fa-comments text-4xl mb-2 opacity-50"></i>
            <p>Aún no hay mensajes</p>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {matches.map((match) => {
              const lastMsg = match.messages[match.messages.length - 1];
              return (
                <div key={match.pet.id} onClick={() => onSelectMatch(match)} className={`flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition border ${match.isSuperLike ? 'border-blue-100 bg-blue-50/30' : 'border-transparent'}`}>
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 relative">
                    <img src={match.pet.imageUrl} className="w-full h-full object-cover" />
                    {match.isSuperLike && (
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-[10px] text-center font-bold">
                            SUPER
                        </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-gray-800 flex items-center gap-1">
                          {match.pet.name}
                          {match.isSuperLike && <i className="fas fa-star text-xs text-blue-500"></i>}
                      </h3>
                      {lastMsg && (
                        <span className="text-xs text-gray-400">
                          {new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {lastMsg ? (lastMsg.sender === 'user' ? `Tú: ${lastMsg.text}` : lastMsg.text) : '¡Han hecho match! Di hola 👋'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};