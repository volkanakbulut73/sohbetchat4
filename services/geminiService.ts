import { GoogleGenAI } from "@google/genai";
import { DEFAULT_MODEL } from '../constants';
import { Message, Role } from '../types';

/**
 * Sends the chat history to the Gemini API and retrieves the response.
 * Uses the @google/genai SDK with the recommended stateless generateContent approach.
 */
export const sendMessageToAI = async (history: Message[]): Promise<string> => {
  try {
    // Initialize the GoogleGenAI client with the API key from the environment.
    // We access process.env.API_KEY directly so that build tools/bundlers can correctly substitute it.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 1. Prepare Content: Convert the app's message history to Gemini's 'Content' format.
    // Gemini expects parts to be an array of objects with a 'text' property.
    // We filter out system messages from the 'contents' array as they are handled in 'config'.
    const contents = history
      .filter(msg => msg.type !== Role.SYSTEM && msg.text && msg.text.trim() !== "")
      .map(msg => ({
        role: msg.type === Role.ASSISTANT ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

    // 2. Extract System Instruction: Find the system message to set the persona.
    const systemMessage = history.find(msg => msg.type === Role.SYSTEM);
    const systemInstruction = systemMessage ? systemMessage.text : undefined;

    // 3. Generate Content
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    // 4. Return the generated text.
    // The .text property is a getter that safely extracts the string from the response candidate.
    return response.text || "";

  } catch (error: any) {
    console.error('Gemini Service Error:', error);
    
    // Provide a more descriptive error if possible, but keep the UI clean.
    if (error.toString().includes("API key")) {
      return "Sistem Mesajı: API Anahtarı yapılandırmasında bir sorun var. (403/400)";
    }
    
    return "Üzgünüm, şu an bağlantı kuramıyorum. Lütfen daha sonra tekrar deneyin.";
  }
};