import React, { useState, useEffect, useRef } from 'react';
import { Message, MatchUI } from '../types';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { listenToMessages, sendMessage, getUserId } from '../services/db';

interface ChatInterfaceProps {
  matchUI: MatchUI;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ matchUI, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = getUserId();

  const isGiverView = matchUI.isGiverView;

  // Initialize Chat Listener
  useEffect(() => {
    const unsubscribe = listenToMessages(matchUI.matchData.id, (msgs) => {
        setMessages(msgs);
    });
    return () => unsubscribe();
  }, [matchUI.matchData.id]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const text = inputText;
    setInputText(''); // optimistic clear

    await sendMessage(matchUI.matchData.id, text);
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
            <img src={matchUI.image} alt={matchUI.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="ml-3">
            <h3 className="font-bold text-gray-800">{matchUI.name}</h3>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
              {matchUI.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div 
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
                <div 
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe
                    ? `${themeColor} text-white rounded-br-none` 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
                >
                {msg.text}
                </div>
            </div>
          );
        })}
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
          disabled={!inputText.trim()}
          className={`p-3 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md ${themeColor} hover:brightness-110`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;