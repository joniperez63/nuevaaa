import { Timestamp } from 'firebase/firestore';

declare global {
  var __firebase_config: string | undefined;
  var __app_id: string | undefined;
  var __initial_auth_token: string | undefined;
}

export type Role = 'adopter' | 'giver';

export interface LocationData {
  lat: number;
  lng: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  role: Role;
  location?: LocationData;
  phone?: string;
  housingType?: string;
  hasKids?: boolean;
  hasPets?: boolean;
  createdAt: any;
}

export interface Pet {
  id: string;
  name: string;
  photoUrl: string;
  ownerId: string;
  location: LocationData;
  castrated: boolean;
  vaccinated: boolean;
  distance?: string; // Calculated on client
  createdAt: any;
}

export interface Interaction {
  id?: string;
  adopterId: string;
  petId: string;
  ownerId: string;
  petName: string;
  petPhoto: string;
  adopterName: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
}

export interface ChatSession {
  id: string;
  otherUser: {
    uid: string;
    name: string;
  };
}