import React, { useState, useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, ShieldAlert, AlertTriangle } from 'lucide-react';
import { db, appId } from '../firebaseConfig.ts';
import { ChatSession, ChatMessage } from '../types.ts';
import { Button } from '../components/UI.tsx';

interface ChatInterfaceProps {
  user: User;
  session: ChatSession;
  onBack: () => void;
  securityModalOpen: boolean;
  setSecurityModalOpen: (open: boolean) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  user, 
  session, 
  onBack, 
  securityModalOpen, 
  setSecurityModalOpen 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'chats', session.id, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
      // Scroll to bottom
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsub();
  }, [session.id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'chats', session.id, 'messages'), {
      text: newMessage,
      senderId: user.uid,
      createdAt: serverTimestamp()
    });
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center gap-3 shadow-sm z-10 safe-top">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
          <ChevronLeft />
        </button>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{session.otherUser.name}</h3>
          <p className="text-xs text-green-500 font-medium">Chat Seguro</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 pb-20">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
              msg.senderId === user.uid 
                ? 'bg-orange-500 text-white rounded-br-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2 pb-6 safe-bottom">
        <input 
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 p-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <button type="submit" className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-md disabled:opacity-50" disabled={!newMessage.trim()}>
          <Send size={20} />
        </button>
      </form>

      {/* MANDATORY SECURITY MODAL */}
      <AnimatePresence>
        {securityModalOpen && (
            <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full border-t-8 border-red-500 shadow-2xl"
            >
                <div className="flex items-center gap-3 text-red-600 mb-4">
                <ShieldAlert size={32} />
                <h2 className="text-xl font-bold">ADVERTENCIA</h2>
                </div>
                <div className="space-y-4 text-gray-700 text-sm">
                <p>Por seguridad, las reuniones deben ser en lugares públicos o en domicilios verificados.</p>
                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                    <p className="font-bold text-red-700 flex items-start gap-2">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                        <span>NUNCA pagues un transporte (Uber/Remis) por adelantado para recibir una mascota.</span>
                    </p>
                    <p className="text-xs text-red-600 mt-1">Es una estafa muy común.</p>
                </div>
                <p className="text-xs text-gray-500">Nueva Vida Mendoza no se hace responsable por traslados ni transacciones monetarias.</p>
                </div>
                <Button 
                variant="danger" 
                className="w-full mt-6"
                onClick={() => setSecurityModalOpen(false)}
                >
                Entendido, tendré cuidado
                </Button>
            </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};