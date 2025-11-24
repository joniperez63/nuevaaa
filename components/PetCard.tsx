import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { Pet } from '../types';
import { MapPin, Info, Maximize2, X, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

interface PetCardProps {
  pet: Pet;
  onSwipe: (direction: 'left' | 'right') => void;
  isFront: boolean;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onSwipe, isFront }) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  // Tag overlay opacity based on swipe direction
  const nopeOpacity = useTransform(x, [-150, -20], [1, 0]);
  const likeOpacity = useTransform(x, [20, 150], [0, 1]);

  const [showDetails, setShowDetails] = useState(false);
  
  // Gallery State
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const galleryImages = pet.images && pet.images.length > 0 ? pet.images : [pet.image];

  useEffect(() => {
    // Reset position when pet changes
    x.set(0);
    controls.start({ x: 0 });
    setShowDetails(false);
    setIsGalleryOpen(false);
    setPhotoIndex(0);
  }, [pet, x, controls]);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;

    if (info.offset.x > threshold || velocity > 800) {
      // Swipe Right
      await controls.start({ x: 500, transition: { duration: 0.2 } });
      onSwipe('right');
    } else if (info.offset.x < -threshold || velocity < -800) {
      // Swipe Left
      await controls.start({ x: -500, transition: { duration: 0.2 } });
      onSwipe('left');
    } else {
      // Reset
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  const openGallery = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFront) {
        setIsGalleryOpen(true);
    }
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const formatAge = (age: number) => {
    if (age < 1) {
      const months = Math.round(age * 12);
      return `${months} Meses`;
    }
    return `${age} Años`;
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Adopta a ${pet.name}`,
          text: `¡Mira a ${pet.name}! Es un ${pet.breed} de ${formatAge(pet.age)}. ${pet.bio}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      alert("La función de compartir no está disponible en este dispositivo/navegador.");
    }
  };

  // Render modal via Portal to escape CSS transform context
  const renderGalleryModal = () => {
    if (!isGalleryOpen) return null;
    
    return createPortal(
      <div 
        className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center backdrop-blur-sm"
        onClick={() => setIsGalleryOpen(false)}
      >
        <button 
          onClick={() => setIsGalleryOpen(false)}
          className="absolute top-6 right-6 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 z-50"
        >
          <X size={28} />
        </button>

        <div className="relative w-full h-full flex items-center justify-center p-4">
            {galleryImages.length > 1 && (
                <>
                    <button 
                        onClick={prevPhoto}
                        className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 z-50"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button 
                        onClick={nextPhoto}
                        className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 z-50"
                    >
                        <ChevronRight size={32} />
                    </button>
                </>
            )}

            <motion.img 
                key={photoIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={galleryImages[photoIndex]}
                alt={`Photo ${photoIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Prevent close on image click
            />

            <div className="absolute bottom-8 left-0 w-full flex justify-center gap-2">
                {galleryImages.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`w-2 h-2 rounded-full transition-all ${idx === photoIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                    />
                ))}
            </div>
        </div>
      </div>,
      document.body
    );
  };

  if (!isFront) {
    return (
      <div className="absolute top-0 left-0 w-full h-full p-4 flex items-center justify-center pointer-events-none z-0">
        <div className="relative w-full h-full max-h-[600px] bg-white rounded-3xl shadow-xl overflow-hidden transform scale-95 opacity-50">
           <img 
            src={pet.image} 
            alt={pet.name} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <>
        {renderGalleryModal()}
        <motion.div
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            animate={controls}
            className="absolute top-0 left-0 w-full h-full p-4 flex items-center justify-center z-10 touch-none"
        >
        <div className="relative w-full h-full max-h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 cursor-grab active:cursor-grabbing">
            
            {/* Swipe Indicators */}
            <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 z-20 transform -rotate-12 border-4 border-teal-500 rounded-lg px-4 py-2 pointer-events-none">
            <span className="text-4xl font-bold text-teal-500 uppercase tracking-widest">LIKE</span>
            </motion.div>
            
            <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 z-20 transform rotate-12 border-4 border-rose-500 rounded-lg px-4 py-2 pointer-events-none">
            <span className="text-4xl font-bold text-rose-500 uppercase tracking-widest">NOPE</span>
            </motion.div>

            {/* Main Image Container */}
            <div className="relative w-full h-full" onClick={openGallery}>
                <img 
                    src={pet.image} 
                    alt={pet.name} 
                    className="w-full h-full object-cover select-none pointer-events-none"
                />
                
                {/* Hint Icon for Gallery */}
                <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm p-2 rounded-full text-white opacity-80 z-10">
                    <Maximize2 size={20} />
                </div>
            </div>

            {/* Gradient Overlay & Info */}
            <div 
                className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/60 to-transparent transition-all duration-300 ${showDetails ? 'h-3/4' : 'h-1/3'}`}
                onClick={(e) => {
                    // If clicking the text area, don't open gallery, just toggle details if desired or do nothing (let bubble)
                    // We let it bubble to card tap unless handled
                }}
            >
            <div className="absolute bottom-0 w-full p-6 text-white">
                <div className="flex justify-between items-end mb-2">
                <div className="pointer-events-none">
                    <h2 className="text-4xl font-extrabold flex items-baseline gap-2">
                    {pet.name} <span className="text-2xl font-normal opacity-90">{formatAge(pet.age)}</span>
                    </h2>
                    <div className="flex items-center gap-1 text-sm font-medium opacity-90 mt-1">
                    <MapPin size={16} />
                    <span>A {pet.distance} km de ti</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleShare}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition pointer-events-auto"
                        title="Compartir"
                    >
                        <Share2 size={24} className="text-white" />
                    </button>
                    <button 
                        onClick={toggleDetails}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition pointer-events-auto"
                        title="Ver más información"
                    >
                        <Info size={24} className="text-white" />
                    </button>
                </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3 pointer-events-none">
                {pet.tags.map(tag => (
                    <span key={tag} className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                    {tag}
                    </span>
                ))}
                </div>

                {/* Expanded Bio */}
                {showDetails && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-gray-200 text-sm leading-relaxed pointer-events-auto"
                >
                    <p className="font-semibold text-white mb-1">{pet.breed}</p>
                    <p>{pet.bio}</p>
                </motion.div>
                )}
            </div>
            </div>
        </div>
        </motion.div>
    </>
  );
};

export default PetCard;