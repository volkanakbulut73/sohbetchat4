import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Paperclip, Smile } from 'lucide-react';
import { Message, Role } from '../types';
import { sendMessageToAI } from '../services/xaiService';
import { SYSTEM_PROMPT } from '../constants';

interface ChatModuleProps {
  roomName?: string;
  accentColor?: string;
}

const ChatModule: React.FC<ChatModuleProps> = ({ 
  roomName = "Chat", 
  accentColor = "from-indigo-500 to-purple-600" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: Role.SYSTEM,
      content: SYSTEM_PROMPT,
      timestamp: Date.now(),
    },
    {
      role: Role.ASSISTANT,
      content: "Merhaba! Ben Workigom AI. Size nasıl yardımcı olabilirim?",
      timestamp: Date.now(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      role: Role.USER,
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseContent = await sendMessageToAI(newHistory);
      
      const assistantMsg: Message = {
        role: Role.ASSISTANT,
        content: responseContent,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        role: Role.ASSISTANT,
        content: "Bir bağlantı hatası oluştu.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter system messages
  const displayMessages = messages.filter((m) => m.role !== Role.SYSTEM);

  return (
    <div className="flex flex-col w-full h-full bg-white relative overflow-hidden font-sans">
      
      {/* --- Chat Stream --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar scroll-smooth">
        {displayMessages.map((msg, idx) => {
          const isUser = msg.role === Role.USER;
          const isAssistant = msg.role === Role.ASSISTANT;

          return (
            <div
              key={idx}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-enter`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center text-xs font-bold shadow-sm overflow-hidden
                  ${isUser ? 'bg-slate-100 border border-slate-200' : 'bg-white border border-indigo-100'}`}>
                  {isUser ? (
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=romance" alt="User" className="w-full h-full" />
                  ) : (
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Workigom&backgroundColor=transparent" alt="Bot" className="w-full h-full" />
                  )}
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  {/* Sender Name (only for others) */}
                  {!isUser && (
                    <span className="text-xs text-gray-500 font-medium ml-1">
                       {isAssistant ? "Workigom AI" : "User"}
                    </span>
                  )}

                  {/* Bubble */}
                  <div className={`relative px-5 py-3.5 text-[15px] leading-relaxed shadow-sm transition-all
                    ${isUser 
                      ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-[10px] text-gray-400 font-medium px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-start w-full animate-enter">
            <div className="flex gap-3 max-w-[70%]">
               <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center text-xs font-bold bg-white border border-indigo-100 overflow-hidden`}>
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Workigom&backgroundColor=transparent" alt="Bot" className="w-full h-full" />
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs text-gray-500 font-medium ml-1">Workigom AI</span>
                 <div className="bg-gray-100 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 w-fit">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                 </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* --- Input Area --- */}
      <div className="bg-white p-4 md:px-8 md:py-6 z-10">
        <form
          onSubmit={handleSendMessage}
          className="relative flex items-center gap-2 bg-gray-100/70 border border-gray-200/50 rounded-full p-2 pl-4 focus-within:bg-white focus-within:border-gray-300 focus-within:shadow-sm transition-all"
        >
          
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Bir şeyler yaz..."
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-400 text-sm md:text-base py-2 min-w-0"
            disabled={isLoading}
          />
          
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors hidden sm:block">
            <Smile className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-200
              ${!inputValue.trim() || isLoading 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md transform active:scale-95'
              }`}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModule;