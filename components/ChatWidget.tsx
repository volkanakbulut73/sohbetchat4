import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Paperclip, Smile, Palette, X, Terminal } from 'lucide-react';
import { Message, Role, User } from '../types';
import { sendMessageToAI } from '../services/xaiService';
import { sendMessageToPB, pb } from '../services/pocketbase';

interface ChatModuleProps {
  roomName?: string;
  messages: Message[];
  currentUser: any;
  activeRoomId: string;
  accentColor?: string;
}

const COLORS = [
  '#0f172a', // Slate 900
  '#dc2626', // Red
  '#d97706', // Amber
  '#059669', // Emerald
  '#2563eb', // Blue
  '#7c3aed', // Violet
  '#db2777', // Pink
];

const EMOJI_CATEGORIES = [
  {
    name: 'Yüzler & Duygular',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', 
      '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', 'ww',
      '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', 
      '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '🙄', '😯', '😦'
    ]
  },
  {
    name: 'İnsanlar & Vücut',
    emojis: [
      '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '👍', 
      '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦵', '🦶', '👂', 
      '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁', '👄', '💋', '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👵', '🧓', 
      '👴', '👲', '👳', '🧕', '👮', '👷', '💂', '🕵️', '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳'
    ]
  },
  {
    name: 'Doğa & Hayvanlar',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', 'cow', '🐷', '🐽', '🐸', '🐵', '🐵', '🙈', '🙉', 
      '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', 
      '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', 
      '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', 
      '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', 
      '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔'
    ]
  }
];

const ChatModule: React.FC<ChatModuleProps> = ({ 
  roomName = "Chat", 
  messages,
  currentUser,
  activeRoomId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#0f172a');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim() || isLoading || !currentUser) return;

    const content = inputValue.trim();
    // Default color logic
    const color = selectedColor !== '#0f172a' ? selectedColor : undefined;

    setInputValue('');
    setShowColorPicker(false);
    setShowEmojiPicker(false);
    
    try {
      // 1. Send User Message to DB
      // We pass user info for denormalization
      await sendMessageToPB(
        activeRoomId, 
        content, 
        Role.USER, 
        currentUser.id, 
        { name: currentUser.name || currentUser.username, avatar: currentUser.avatar }
      );
      
      // 2. Trigger AI Response (Frontend logic for demo)
      setIsLoading(true);

      const tempHistory: Message[] = [
        ...messages,
        { 
          text: content,
          type: Role.USER, 
          room: activeRoomId, 
          senderId: currentUser.id, 
          senderName: currentUser.name || currentUser.username,
          senderAvatar: currentUser.avatar,
          isUser: true,
          id: 'temp', 
          created: '', 
          updated: '', 
          collectionId: '', 
          collectionName: '' 
        }
      ];

      try {
        const responseContent = await sendMessageToAI(tempHistory);
        await sendMessageToPB(
            activeRoomId, 
            responseContent, 
            Role.ASSISTANT, 
            currentUser.id,
            { name: 'Grok', avatar: '' } // AI Info
        );

      } catch (aiError) {
        console.error("AI Error", aiError);
        const errorMessage = aiError instanceof Error ? aiError.message : "Bağlantı hatası.";
        await sendMessageToPB(activeRoomId, `Hata: ${errorMessage}`, Role.ASSISTANT, currentUser.id, { name: 'Grok', avatar: '' });
      }

    } catch (error) {
      console.error("Message send failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const displayMessages = messages.filter((m) => m.type !== Role.SYSTEM);

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 relative overflow-hidden font-sans">
      
      {/* --- Chat Stream --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar scroll-smooth">
        {displayMessages.map((msg, idx) => {
          // Identify based on 'type' or 'isUser'
          const isUser = msg.type === Role.USER || msg.isUser === true;
          const isAssistant = msg.type === Role.ASSISTANT || msg.type === 'assistant';
          
          // Use denormalized fields
          const senderName = msg.senderName || (isAssistant ? "Grok" : "Kullanıcı");
          // Construct avatar URL if filename exists
          const senderAvatar = msg.senderAvatar 
            ? `${pb.baseUrl}/api/files/users/${msg.senderId}/${msg.senderAvatar}`
            : null;
          
          const isMe = msg.senderId === currentUser.id && !isAssistant;

          return (
            <div
              key={msg.id || idx}
              className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-enter`}
            >
              <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center text-xs font-bold shadow-sm overflow-hidden border
                  ${isMe ? 'bg-gray-100 border-gray-200' : isAssistant ? 'bg-black text-white border-black' : 'bg-white border-gray-200'}`}>
                  {isAssistant ? (
                    <div className="flex items-center justify-center w-full h-full bg-black text-white">
                      <Terminal size={20} className="text-white" />
                    </div>
                  ) : (
                    <img src={senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderName}`} alt={senderName} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  {/* Sender Name */}
                  {!isMe && (
                    <span className="text-xs text-gray-500 font-medium ml-1 flex items-center gap-1">
                       {senderName}
                       {isAssistant && <span className="bg-gray-900 text-white text-[9px] px-1 rounded font-bold tracking-wider">AI</span>}
                    </span>
                  )}

                  {/* Bubble */}
                  <div className={`relative px-5 py-3.5 text-[15px] leading-relaxed shadow-sm transition-all group
                    ${isMe 
                      ? 'bg-black text-white rounded-2xl rounded-tr-none font-medium' 
                      : isAssistant 
                        ? 'bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-tl-none font-medium'
                        : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words" style={{ color: msg.color || 'inherit' }}>
                      {msg.text}
                    </div>
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-[10px] text-gray-400 font-medium px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
               <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center text-xs font-bold bg-black border border-black overflow-hidden`}>
                 <Terminal size={20} className="text-white" />
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs text-gray-500 font-medium ml-1">Grok</span>
                 <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-200 flex items-center gap-2 w-fit">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                 </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* --- Input Area --- */}
      <div className="bg-gray-50 p-4 md:px-8 md:py-6 z-10 border-t border-gray-200">
        
        {/* Color Palette Popup */}
        {showColorPicker && (
          <div className="absolute bottom-20 left-12 bg-white rounded-xl shadow-xl border border-gray-200 p-3 flex gap-2 animate-enter z-20">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => { setSelectedColor(color); setShowColorPicker(false); inputRef.current?.focus(); }}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${selectedColor === color ? 'border-black scale-110 ring-2 ring-offset-2 ring-gray-300' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
                type="button"
                title={color}
              />
            ))}
          </div>
        )}

        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 sm:right-8 w-80 max-w-[calc(100vw-2rem)] h-96 bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col animate-enter z-20 overflow-hidden">
             <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Emoji Seç</span>
                <button onClick={() => setShowEmojiPicker(false)} className="text-gray-400 hover:text-black">
                  <X size={18} />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {EMOJI_CATEGORIES.map((category) => (
                   <div key={category.name} className="mb-4">
                      <h4 className="px-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 bg-white/95 backdrop-blur-sm py-1 z-10">
                        {category.name}
                      </h4>
                      <div className="grid grid-cols-7 gap-1">
                        {category.emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleAddEmoji(emoji)}
                            className="w-9 h-9 flex items-center justify-center text-xl hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="relative flex items-center gap-2 bg-white border border-gray-200 rounded-full p-2 pl-4 focus-within:bg-white focus-within:border-black focus-within:shadow-md transition-all shadow-sm"
        >
          <button 
            type="button" 
            onClick={() => { setShowColorPicker(!showColorPicker); setShowEmojiPicker(false); }}
            className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
            title="Yazı Rengi"
          >
             <Palette className="w-5 h-5" style={{ color: selectedColor !== '#0f172a' ? selectedColor : undefined }} />
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ color: selectedColor }}
            placeholder={`${roomName} odasına yaz...`}
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base py-2 min-w-0"
            disabled={isLoading}
          />
          
          <button 
             type="button" 
             onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowColorPicker(false); }}
             className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-black hover:bg-gray-100'}`}
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200
              ${!inputValue.trim() || isLoading 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800 hover:shadow-xl transform active:scale-95'
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
