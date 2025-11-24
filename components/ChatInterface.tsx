import React, { useState, useEffect, useRef } from 'react';
import { Pet, Message, Candidate, Match } from '../types';
import { startPetChat, startAdopterChat } from '../services/geminiService';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Chat, GenerateContentResponse } from '@google/genai';

interface ChatInterfaceProps {
  match: Match;
  matchData: Pet | Candidate; // Can be a Pet or a Candidate depending on view
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ match, matchData, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isGiverView = match.isGiverView;

  // Initialize Chat
  useEffect(() => {
    const initChat = async () => {
      try {
        let chat;
        let initialText = '';

        if (isGiverView) {
            // I am the Giver, chatting with an Adopter (Candidate)
            const candidate = matchData as Candidate;
            chat = await startAdopterChat(candidate);
            initialText = `¡Hola! Muchas gracias por aceptar mi solicitud para adoptar. ¿Cuándo podría conocer a la mascota? 😍`;
        } else {
            // I am the Adopter, chatting with the Owner/Pet
            const pet = matchData as Pet;
            chat = await startPetChat(pet);
            initialText = `¡Hola! He visto que te intereso. Soy el humano de ${pet.name}. Pregúntame lo que quieras sobre su adopción.`;
        }
        
        setChatSession(chat);
        
        // Check if we have previous messages (mocked) or start fresh
        if (match.lastMessage) {
             // In a real app we load history. Here we just push the last one or init.
        }

        const initialMsg: Message = {
          id: 'init',
          sender: 'match',
          text: initialText,
          timestamp: new Date()
        };
        setMessages([initialMsg]);
      } catch (e) {
        console.error("Failed to start chat", e);
      }
    };
    initChat();
  }, [matchData, isGiverView]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatSession) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const result: GenerateContentResponse = await chatSession.sendMessage({ message: userMsg.text });
      const responseText = result.text || "Disculpa, no entendí bien.";
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'match',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
      const errorMsg: Message = {
        id: 'err',
        sender: 'match',
        text: "Hubo un error de conexión, intenta de nuevo.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const themeColor = isGiverView ? 'bg-teal-500' : 'bg-orange-500';
  const themeRing = isGiverView ? 'focus:ring-teal-200' : 'focus:ring-orange-200';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center p-4 shadow-sm border-b border-gray-100 z-10 bg-white">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center ml-2">
          <div className="relative">
            <img src={matchData.image} alt={matchData.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="ml-3">
            <h3 className="font-bold text-gray-800">{matchData.name}</h3>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <Sparkles size={10} className="text-yellow-500" /> 
              {isGiverView ? 'Interesado en adoptar' : 'Dueño de Mascota'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? `${themeColor} text-white rounded-br-none` 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200 flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          className={`flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 ${themeRing}`}
        />
        <button 
          onClick={handleSend}
          disabled={!inputText.trim() || loading}
          className={`p-3 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md ${themeColor} hover:brightness-110`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;