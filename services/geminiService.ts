import { GoogleGenAI, Chat } from "@google/genai";
import { Pet, Candidate } from '../types';

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
      console.warn("API Key not found in environment variables.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

// Start a chat session acting as the pet/owner (For the Adopter User)
export const startPetChat = async (pet: Pet): Promise<Chat> => {
  const client = getClient();
  
  const systemInstruction = `
    Roleplay as the OWNER of a pet named ${pet.name} (acting on behalf of the pet).
    
    Animal Details:
    - Species/Breed: ${pet.breed}
    - Age: ${pet.age} years old
    - Personality: ${pet.personality}
    - Bio Context: "${pet.bio}"

    Your goal: You have accepted a match with a potential adopter. Be friendly, answer questions about the pet.
    
    Guidelines:
    1. Respond in Spanish (Español).
    2. Keep responses short and conversational.
    3. You can occasionally switch to speaking AS the pet for cuteness, but mostly speak as a responsible owner arranging the adoption.
    4. Be polite and ask the adopter questions too.
  `;

  return client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.8, 
    },
  });
};

// Start a chat session acting as a Potential Adopter (For the Giver User)
export const startAdopterChat = async (candidate: Candidate): Promise<Chat> => {
  const client = getClient();
  
  const systemInstruction = `
    Roleplay as a person named ${candidate.name} who wants to adopt a pet.
    
    Your Profile:
    - Age: ${candidate.age}
    - Housing: ${candidate.housingType}
    - Family: ${candidate.familyInfo}
    - Bio: "${candidate.bio}"

    Context: You have just been "Matched" (Approved) by the owner of the pet you wanted. You are excited.

    Guidelines:
    1. Respond in Spanish (Español).
    2. Be enthusiastic about the adoption.
    3. Ask when you can meet the pet.
    4. Keep it casual like a WhatsApp chat.
  `;

  return client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.9, 
    },
  });
};

// Generate a creative "Why adopt me" pitch
export const generatePitch = async (pet: Pet): Promise<string> => {
  const client = getClient();
  try {
    const prompt = `Write a very short, funny, and cute 2-sentence "pick-up line" or reason to adopt this pet in Spanish. 
    Pet: ${pet.name}, ${pet.breed}, Personality: ${pet.personality}.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text?.trim() || pet.bio;
  } catch (error) {
    console.error("Error generating pitch:", error);
    return pet.bio;
  }
};