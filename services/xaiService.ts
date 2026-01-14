import { GoogleGenAI } from "@google/genai";
import { DEFAULT_MODEL } from '../constants';
import { Message, Role } from '../types';

// Safely retrieve API Key
const getApiKey = () => (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';

// Lazy initialization to prevent top-level crash
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const key = getApiKey();
    if (!key) {
      // Throwing here allows the caller to catch it and display a UI error instead of crashing the app
      throw new Error("API Key is missing. Please check your configuration.");
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

/**
 * Sends the chat history to the Gemini API and retrieves the response.
 */
export const sendMessageToAI = async (history: Message[]): Promise<string> => {
  try {
    // Check key before attempting initialization to handle gracefully in UI
    const key = getApiKey();
    if (!key) {
        return "Sistem Mesajı: API Anahtarı eksik. Yapay zeka şu an yanıt veremiyor. (Lütfen yönetici ile iletişime geçin)";
    }

    // Initialize client on demand
    const ai = getAI();

    // 1. Prepare contents
    const contents = history
      .filter(msg => msg.type !== Role.SYSTEM) // Using 'type' now
      .map(msg => ({
        role: msg.type === Role.ASSISTANT ? 'model' : 'user', // Map our type to GenAI role
        parts: [{ text: msg.text }], // Use 'text' instead of 'content'
      }));

    // 2. Prepare config (system instruction)
    const systemMessage = history.find(msg => msg.type === Role.SYSTEM);
    const config: any = {};
    if (systemMessage) {
        config.systemInstruction = systemMessage.text;
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
    console.error('AI Service Error:', error);
    // Return a user-friendly error message if it's an API key issue
    if (error instanceof Error && (error.message.includes("API Key") || error.message.includes("400"))) {
       return "Bağlantı hatası: API Anahtarı eksik veya geçersiz.";
    }
    return "Bir hata oluştu, şu an yanıt veremiyorum.";
  }
};
