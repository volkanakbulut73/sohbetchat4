import { GoogleGenAI } from "@google/genai";
import { DEFAULT_MODEL } from '../constants';
import { Message, Role } from '../types';

/**
 * Sends the chat history to the Gemini API and retrieves the response.
 */
export const sendMessageToAI = async (history: Message[]): Promise<string> => {
  try {
    // Safely check for API Key existence.
    // The polyfill in index.html ensures process.env is accessible without crashing.
    const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

    if (!apiKey) {
      console.warn("Gemini API Key is missing. Please configure process.env.API_KEY.");
      return "Sistem Mesajı: API Anahtarı eksik. Sohbet botu şu an yanıt veremiyor.";
    }

    // Initialize the GoogleGenAI client
    const ai = new GoogleGenAI({ apiKey });

    // 1. Prepare Content
    const contents = history
      .filter(msg => msg.type !== Role.SYSTEM && msg.text && msg.text.trim() !== "")
      .map(msg => ({
        role: msg.type === Role.ASSISTANT ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

    // 2. Extract System Instruction
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

    // 4. Return text
    return response.text || "";

  } catch (error: any) {
    console.error('Gemini Service Error:', error);
    
    // Provide a generic error message
    return "Üzgünüm, şu an bağlantı kuramıyorum. Lütfen daha sonra tekrar deneyin.";
  }
};