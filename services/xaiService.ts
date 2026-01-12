import { GoogleGenAI } from "@google/genai";
import { DEFAULT_MODEL } from '../constants';
import { Message, Role } from '../types';

// Initialize the Gemini client
// Note: In production, ensure your API key is restricted to your domain
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends the chat history to the Gemini API and retrieves the response.
 */
export const sendMessageToAI = async (history: Message[]): Promise<string> => {
  try {
    // 1. Prepare contents
    const contents = history
      .filter(msg => msg.role !== Role.SYSTEM)
      .map(msg => ({
        role: msg.role === Role.ASSISTANT ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    // 2. Prepare config (system instruction)
    const systemMessage = history.find(msg => msg.role === Role.SYSTEM);
    const config: any = {};
    if (systemMessage) {
        config.systemInstruction = systemMessage.content;
    }

    // 3. Make API call
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: contents,
      config: config
    });

    // 4. Validate and return
    if (response.text) {
      return response.text;
    } else {
      console.warn("Empty response from AI model");
      return "Hmm, sesim kesildi. (Boş cevap döndü)";
    }

  } catch (error) {
    // Log the error but re-throw a sanitized version or handle it gracefully
    console.error('AI Service Error:', error);
    throw new Error('Service communication failed');
  }
};