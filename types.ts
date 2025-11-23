export enum Species {
  DOG = 'Perro',
  CAT = 'Gato'
}

export type UserRole = 'ADOPTER' | 'GIVER';

export interface Pet {
  id: string;
  name: string;
  age: number;
  species: Species;
  breed: string;
  bio: string;
  imageUrl: string;
  personality: string; // Used for Gemini prompt
  distance: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'pet';
  text: string;
  timestamp: Date;
}

export interface Match {
  pet: Pet;
  messages: Message[];
  lastMessageAt: Date;
  isSuperLike?: boolean; // New property for Super Match
}

export interface UserPreferences {
  name: string;
  role: UserRole;
  preferredSpecies: Species | 'BOTH';
  maxDistance: number;
  // New adoption details
  housingType?: 'HOUSE' | 'APARTMENT';
  ownership?: 'OWNED' | 'RENTED';
  hasYard?: boolean;
  hasKids?: boolean;
}