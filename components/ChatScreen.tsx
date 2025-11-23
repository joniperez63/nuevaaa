import React, { useState, useEffect, useRef } from 'react';
import { Match, Message } from '../types';
import { generatePetResponse } from '../services/geminiService';

interface ChatScreenProps {
  match: Match;
  onBack: () => void;
  onUpdateMatch: (updatedMatch: Match) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ match, onBack, onUpdateMatch }) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [match.messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    const updatedMessages = [...match.messages, newUserMsg];
    
    // Update local state immediately
    onUpdateMatch({
      ...match,
      messages: updatedMessages,
      lastMessageAt: new Date()
    });
    
    setInputText('');
    setIsTyping(true);

    // Call Gemini
    const aiResponseText = await generatePetResponse(match.pet, updatedMessages, newUserMsg.text);

    const newPetMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'pet',
      text: aiResponseText,
      timestamp: new Date()
    };

    setIsTyping(false);
    
    onUpdateMatch({
      ...match,
      messages: [...updatedMessages, newPetMsg],
      lastMessageAt: new Date()
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-16 border-b flex items-center px-4 bg-white shadow-sm z-10 sticky top-0">
        <button onClick={onBack} className="mr-4 text-gray-500">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
          <img src={match.pet.imageUrl} alt={match.pet.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{match.pet.name}</h3>
          <span className="text-xs text-green-500 font-medium">● En línea</span>
        </div>
        <div className="ml-auto text-gray-400">
          <i className="fas fa-shield-alt"></i>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        <div className="text-center text-xs text-gray-400 my-4">
          Has hecho match con {match.pet.name} el {new Date().toLocaleDateString()}
        </div>
        
        {match.messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'pet' && (
               <div className="w-8 h-8 rounded-full overflow-hidden mr-2 self-end mb-1">
                 <img src={match.pet.imageUrl} className="w-full h-full object-cover" />
               </div>
            )}
            <div 
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                msg.sender === 'user' 
                  ? 'bg-red-500 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
             <div className="w-8 h-8 rounded-full overflow-hidden mr-2 self-end mb-1">
                 <img src={match.pet.imageUrl} className="w-full h-full object-cover" />
             </div>
             <div className="bg-gray-200 px-4 py-3 rounded-2xl rounded-bl-none flex space-x-1 items-center">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white flex items-center gap-2">
        <button className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
          <i className="fas fa-camera"></i>
        </button>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-200"
        />
        {inputText.trim() ? (
          <button 
            onClick={handleSend}
            className="w-10 h-10 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition"
          >
            <i className="fas fa-paper-plane text-sm"></i>
          </button>
        ) : (
             <button className="w-10 h-10 rounded-full bg-gray-100 text-gray-400">
              <i className="fas fa-microphone"></i>
            </button>
        )}
      </div>
    </div>
  );
};