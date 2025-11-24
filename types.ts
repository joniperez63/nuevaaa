
export interface Pet {
  id: string;
  name: string;
  age: number;
  breed: string;
  image: string;
  images?: string[]; // Multiple images for gallery
  bio: string; // Short bio
  personality: string; // For AI persona
  distance: number; // km away
  tags: string[];
  status?: 'available' | 'adopted'; // New field for adoption status
  type?: 'dog' | 'cat' | 'other'; // Basic type for filtering
}

export interface Message {
  id: string;
  sender: 'user' | 'match';
  text: string;
  timestamp: Date;
}

export interface Match {
  id: string;
  targetId: string; // ID of the Pet (if Adopter) or Candidate (if Giver)
  name: string;
  image: string;
  subtitle: string;
  matchedAt: Date;
  lastMessage?: string;
  isGiverView: boolean; // true if the user is the Giver chatting with an Adopter
}

export enum AppView {
  TERMS = 'TERMS',
  ROLE_SELECTION = 'ROLE_SELECTION',
  ADOPTER_FORM = 'ADOPTER_FORM',
  GIVER_FORM = 'GIVER_FORM',
  GIVER_DASHBOARD = 'GIVER_DASHBOARD', // New view for Givers to manage requests
  SWIPE = 'SWIPE',
  MATCHES = 'MATCHES',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE'
}

export type SwipeDirection = 'left' | 'right' | 'none';

export interface AdopterProfile {
  name: string; // Added name
  profileImage: string; // Added profile image
  housingType: 'casa' | 'departamento';
  ownership: 'propia' | 'alquila';
  hasChildren: boolean;
  hasOtherPets: boolean;
}

export interface GiverProfile {
  petName: string;
  description: string;
  isNeutered: boolean;
  isVaccinated: boolean;
  images: string[];
}

// Mock interface for people applying to adopt
export interface Candidate {
  id: string;
  name: string;
  age: number;
  image: string;
  housingType: string;
  familyInfo: string;
  bio: string;
  applyingForPetId: string; // Which pet they want
}
