import { GoogleGenAI } from "@google/genai";
import { DEFAULT_MODEL } from '../constants';
import { Message, Role } from '../types';

/**
 * Sends the chat history to the Gemini API and retrieves the response.
 * Uses the @google/genai SDK.
 */
export const sendMessageToAI = async (history: Message[]): Promise<string> => {
  try {
    // Initialize the GoogleGenAI client.
    // We use process.env.API_KEY directly.
    // In a build environment, 'process.env.API_KEY' is typically replaced by the actual key string.
    // We do NOT check if 'process' exists, as that can prevent the replacement from working if the bundler
    // sees the conditional.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 1. Prepare Content
    // Filter out empty messages and system prompts for the 'contents' array
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
    
    // Fallback error message
    return "Üzgünüm, şu an yanıt veremiyorum. (Bağlantı Hatası)";
  }
};