import { GoogleGenAI } from "@google/genai";
import { DEFAULT_MODEL } from '../constants';
import { Message, Role } from '../types';

/**
 * Sends the chat history to the AI API.
 * Implements a safe initialization pattern to prevent browser crashes.
 */
export const sendMessageToAI = async (history: Message[]): Promise<string> => {
  try {
    // 1. Safe API Key Retrieval for Browser Environment
    const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

    // 2. Check if Key is Missing
    if (!apiKey) {
      console.warn("Gemini API Key missing.");
      // Return a standard system message
      return "Sistem: API Anahtarı yapılandırılmamış. Lütfen 'process.env.API_KEY' değerinin doğru ayarlandığından emin olun.";
    }

    // 3. Initialize SDK
    const ai = new GoogleGenAI({ apiKey });

    // 4. Prepare Content
    const contents = history
      .filter(msg => msg.type !== Role.SYSTEM && msg.text && msg.text.trim() !== "")
      .map(msg => ({
        role: msg.type === Role.ASSISTANT ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

    // 5. Extract System Instruction
    const systemMessage = history.find(msg => msg.type === Role.SYSTEM);
    const systemInstruction = systemMessage ? systemMessage.text : undefined;

    // 6. Generate Content
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "";

  } catch (error: any) {
    console.error('AI Service Error:', error);
    
    // Check for specific API errors
    if (error.toString().includes("403") || error.toString().includes("API key")) {
        return "Bağlantı Hatası: API Anahtarı geçersiz veya yetkisiz erişim.";
    }

    return "Üzgünüm, şu an bağlantı kuramıyorum. Lütfen daha sonra tekrar deneyin.";
  }
};