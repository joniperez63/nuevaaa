
export interface Pet {
  id: string;
  ownerId?: string; // ID of the user who posted the pet
  name: string;
  age: number;
  breed: string;
  image: string;
  images?: string[]; 
  bio: string;
  personality: string;
  distance: number;
  tags: string[];
  status?: 'available' | 'adopted';
  type?: 'dog' | 'cat' | 'other';
  createdAt?: number;
}

export interface Message {
  id: string;
  matchId?: string;
  senderId: string; // userId
  text: string;
  timestamp: number; // Unix timestamp for simpler sorting in Firestore
}

export interface Match {
  id: string;
  petId: string;
  petName: string;
  petImage: string;
  
  adopterId: string;
  adopterName: string;
  adopterImage: string;
  
  ownerId: string;
  
  matchedAt: number;
  lastMessage?: string;
  lastMessageTimestamp?: number;
}

// Helper for UI display logic
export interface MatchUI {
  id: string; // The match ID
  targetId: string; // ID of the person/pet to chat with
  name: string; // Name to display
  image: string; // Image to display
  subtitle: string;
  isGiverView: boolean;
  matchData: Match; // Original match data
}

export enum AppView {
  TERMS = 'TERMS',
  ROLE_SELECTION = 'ROLE_SELECTION',
  ADOPTER_FORM = 'ADOPTER_FORM',
  GIVER_FORM = 'GIVER_FORM',
  GIVER_DASHBOARD = 'GIVER_DASHBOARD',
  SWIPE = 'SWIPE',
  MATCHES = 'MATCHES',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE'
}

export type SwipeDirection = 'left' | 'right' | 'none';

export interface AdopterProfile {
  id?: string; // userId
  name: string;
  profileImage: string;
  housingType: 'casa' | 'departamento';
  ownership: 'propia' | 'alquila';
  hasChildren: boolean;
  hasOtherPets: boolean;
}

export interface Candidate {
  id: string; // ID of the 'Like' document
  adopterId: string;
  name: string;
  age: number; // derived or mock
  image: string;
  housingType: string;
  familyInfo: string;
  bio: string;
  applyingForPetId: string;
  createdAt: number;
}