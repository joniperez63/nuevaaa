import { GoogleGenAI } from "@google/genai";
import { Pet, Message } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePetResponse = async (
  pet: Pet,
  history: Message[],
  userMessage: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "... (Error de conexión con IA)";

  // Construct context
  const systemPrompt = `
    Estás actuando como una mascota en una app de adopción. 
    Tu nombre es ${pet.name}. Eres un ${pet.breed} (${pet.species}) de ${pet.age} años.
    Tu biografía dice: "${pet.bio}".
    Tu personalidad oculta (guía de estilo): "${pet.personality}".
    
    Estás chateando con un posible adoptante. 
    Responde en PRIMERA PERSONA como si fueras la mascota. 
    Mantén las respuestas cortas (menos de 40 palabras), divertidas y apropiadas para tu especie.
    Si eres un perro, sé entusiasta o leal. Si eres un gato, sé un poco distante o cariñoso según te convenga.
    No uses hashtags. Habla español.
  `;

  // Format history for the model
  // We take the last few messages to keep context window small and relevant
  const recentHistory = history.slice(-5).map(msg => 
    `${msg.sender === 'user' ? 'Adoptante' : pet.name}: ${msg.text}`
  ).join('\n');

  const prompt = `
    ${systemPrompt}
    
    Historial de chat reciente:
    ${recentHistory}
    Adoptante: ${userMessage}
    ${pet.name}:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "*mueve la cola*";
  } catch (error) {
    console.error("Error generating pet response:", error);
    return "*se queda mirando fijamente* (Error de red)";
  }
};