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
    const errString = error.toString();
    
    // Check for Quota/Rate Limit (429)
    if (errString.includes("429") || errString.includes("ResourceExhausted") || errString.includes("quota")) {
        return "Sistem: Ücretsiz kullanım kotası aşıldı (Hata 429). Lütfen bir süre bekleyip tekrar deneyin.";
    }

    // Check for API Key issues (400/403)
    if (errString.includes("403") || errString.includes("API key") || errString.includes("400")) {
        return "Bağlantı Hatası: API Anahtarı geçersiz veya yetkisiz erişim.";
    }

    // Check for Service Overload (503)
    if (errString.includes("503")) {
         return "Sistem: Servis şu an çok yoğun. Lütfen biraz sonra tekrar deneyin.";
    }

    return "Üzgünüm, şu an teknik bir sorun nedeniyle yanıt veremiyorum.";
  }
};