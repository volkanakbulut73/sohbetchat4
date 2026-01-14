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
    let apiKey: string | undefined = undefined;
    
    try {
        // We access process.env.API_KEY directly. 
        // In many build tools (Vite, Webpack), this expression is replaced by the actual string value during build.
        // We wrap in try-catch to handle environments where 'process' is not defined and not replaced.
        // @ts-ignore
        apiKey = process.env.API_KEY;
    } catch (e) {
        // ignore ReferenceError
    }

    // 2. Simulation/Demo Mode if Key is Missing
    // Instead of blocking the user with an error, we provide a helpful fallback response.
    if (!apiKey) {
      console.warn("Gemini API Key missing. Using Demo Response.");
      
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple context awareness for demo mode
      const lastMsg = history.filter(m => m.type === Role.USER).pop()?.text.toLowerCase() || "";
      
      if (lastMsg.includes("merhaba") || lastMsg.includes("selam")) {
          return "Merhaba! Şu anda Demo modundayım (API anahtarı eksik). Size nasıl yardımcı olabilirim?";
      } else if (lastMsg.includes("nasılsın")) {
          return "Teşekkürler, iyiyim! Demo modunda olsam bile yardımcı olmaya hazırım.";
      }
      
      return "Sistem: API Anahtarı (process.env.API_KEY) bulunamadı. Demo yanıtı: Gerçek yapay zeka bağlantısı için lütfen API anahtarını yapılandırın.";
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