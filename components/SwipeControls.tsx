import React from 'react';
import { X, Heart, Star } from 'lucide-react';

interface SwipeControlsProps {
  onSwipe: (direction: 'left' | 'right') => void;
  onSuperLike?: () => void;
}

const SwipeControls: React.FC<SwipeControlsProps> = ({ onSwipe, onSuperLike }) => {
  return (
    <div className="flex items-center justify-center gap-6 pb-6 px-4 w-full max-w-md mx-auto">
      <button 
        onClick={() => onSwipe('left')}
        className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:scale-110 transition-all active:scale-95 border border-rose-100"
      >
        <X size={32} strokeWidth={3} />
      </button>

      <button 
        onClick={onSuperLike}
        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-violet-500 hover:bg-violet-50 hover:scale-110 transition-all active:scale-95 border border-violet-100"
      >
        <Star size={20} fill="currentColor" className="text-violet-500" />
      </button>

      <button 
        onClick={() => onSwipe('right')}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-teal-400 to-teal-600 shadow-lg shadow-teal-200 flex items-center justify-center text-white hover:scale-110 transition-all active:scale-95"
      >
        <Heart size={30} fill="currentColor" />
      </button>
    </div>
  );
};

export default SwipeControls;