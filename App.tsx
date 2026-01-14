import React, { useState, useEffect, useRef } from 'react';
import ChatModule from './components/ChatWidget';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import { LayoutGrid, MessageSquare, Users, Settings, LogOut, Search, Menu, Hash, Folder, ChevronDown, X, Lock, Unlock, Mail, MailWarning, UserMinus, Loader2, AlertCircle } from 'lucide-react';
import { Room, User, Message, Role } from './types';
import { 
  pb, 
  logout, 
  getCurrentUser, 
  getUsers, 
  getPublicRooms, 
  getPrivateRoom, 
  createPrivateRoom, 
  getMessages, 
  subscribeToRoom, 
  unsubscribeFromRoom,
  getBlockedUsers,
  blockUser,
  unblockUser
} from './services/pocketbase';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<any>(getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState(false);

  // App Data State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [activeRoomMessages, setActiveRoomMessages] = useState<Message[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // UI State
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);
  const [userListOpen, setUserListOpen] = useState(false);
  const [allowDMs, setAllowDMs] = useState(true);
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());

  // Refs for cleanup
  const activeRoomIdRef = useRef<string>('');

  // 1. Initial Load & Auth Check
  useEffect(() => {
    // Check if logged in
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
      loadAppData();
    }

    // Listen to auth changes
    const removeListener = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
      if (model) {
        setShowAuthModal(false); // Close modal on success
        loadAppData();
      } else {
        // Reset state on logout
        setRooms([]);
        setUsers([]);
        setActiveRoomMessages([]);
        setActiveRoomId('');
        setDataError(null);
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  // 2. Load Data (Rooms, Users, Blocks)
  const loadAppData = async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      // Fetch Users
      const usersData = await getUsers();
      setUsers(usersData);

      // Fetch Blocked Users
      if (pb.authStore.model) {
        const blocks = await getBlockedUsers(pb.authStore.model.id);
        setBlockedUserIds(new Set(blocks));
      }

      // Fetch Rooms
      const roomsData = await getPublicRooms();
      setRooms(roomsData);
      
      if (roomsData.length > 0) {
        handleSwitchRoom(roomsData[0].id, roomsData);
      } else {
         setDataError("Hiç oda bulunamadı. Lütfen yöneticinizle iletişime geçin.");
      }
    } catch (err: any) {
      console.error("Failed to load app data", err);
      setDataError("Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.");
    } finally {
      setDataLoading(false);
    }
  };

  // 3. Realtime Chat Subscription
  useEffect(() => {
    if (!activeRoomId) return;

    // Load history first
    getMessages(activeRoomId).then(msgs => {
      setActiveRoomMessages(msgs);
    });

    // Subscribe
    unsubscribeFromRoom(); // Unsub previous
    subscribeToRoom(activeRoomId, (newMessage) => {
      setActiveRoomMessages(prev => {
        if (prev.find(m => m.id === newMessage.id)) return prev;
        
        // Enrich with user data if missing
        const sender = users.find(u => u.id === newMessage.user_id);
        if (sender) {
           newMessage.expand = { user_id: sender };
        }
        return [...prev, newMessage];
      });
    });

    return () => {
      unsubscribeFromRoom();
    };
  }, [activeRoomId, users]);

  const handleSwitchRoom = async (roomId: string, currentRooms = rooms) => {
    const targetRoom = currentRooms.find(r => r.id === roomId);
    if (!targetRoom) return;

    activeRoomIdRef.current = roomId;
    setActiveRoomId(roomId);
    setRoomMenuOpen(false);
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  // Derive active participants based on room type
  const activeParticipants = React.useMemo(() => {
    if (!activeRoom) return [];
    if (activeRoom.type === 'private') {
       return users.filter(u => activeRoom.participants.includes(u.id));
    }
    return users; 
  }, [activeRoom, users]);


  // --- Actions ---

  const handleLogout = () => {
    logout();
  };

  const handleUserDoubleClick = async (targetUserId: string) => {
    if (!currentUser || targetUserId === currentUser.id) return;
    
    const targetUser = users.find(u => u.id === targetUserId);
    if (targetUser?.isBot) return;

    if (!allowDMs) {
      alert("Özel mesaj alımını kapattınız.");
      return;
    }

    try {
      let room = await getPrivateRoom(currentUser.id, targetUserId);
      if (!room && targetUser) {
        room = await createPrivateRoom(currentUser.id, targetUser);
      }

      if (room) {
        setRooms(prev => {
          if (prev.find(r => r.id === room?.id)) return prev;
          return [...prev, room as Room];
        });
        handleSwitchRoom(room.id);
        setUserListOpen(false);
      }
    } catch (err) {
      console.error("Failed to start DM", err);
    }
  };

  const toggleBlockUser = async () => {
    if (!activeRoom || activeRoom.type !== 'private' || !currentUser) return;
    
    const otherUserId = activeRoom.participants.find(id => id !== currentUser.id);
    if (!otherUserId) return;

    try {
      if (blockedUserIds.has(otherUserId)) {
        await unblockUser(currentUser.id, otherUserId);
        setBlockedUserIds(prev => {
          const next = new Set(prev);
          next.delete(otherUserId);
          return next;
        });
      } else {
        await blockUser(currentUser.id, otherUserId);
        setBlockedUserIds(prev => new Set(prev).add(otherUserId));
      }
    } catch (e) {
      console.error("Block action failed", e);
    }
  };

  const isCurrentChatBlocked = React.useMemo(() => {
      if (!activeRoom || activeRoom.type !== 'private' || !currentUser) return false;
      const otherId = activeRoom.participants.find(id => id !== currentUser.id);
      return otherId ? blockedUserIds.has(otherId) : false;
  }, [activeRoom, blockedUserIds, currentUser]);

  // --- RENDER LOGIC ---

  // 1. Not Logged In -> Show Landing Page
  if (!currentUser) {
    return (
      <>
        <LandingPage onLoginClick={() => setShowAuthModal(true)} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  // 2. Data Error State
  if (dataError) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50 text-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Hata Oluştu</h2>
        <p className="text-gray-600 mb-6">{dataError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Sayfayı Yenile
        </button>
        <button 
          onClick={handleLogout}
          className="mt-4 text-sm text-gray-500 hover:underline"
        >
          Çıkış Yap
        </button>
      </div>
    );
  }

  // 3. Logged In but loading room -> Loading Spinner
  if (!activeRoom) {
     return (
       <div className="flex flex-col h-screen items-center justify-center bg-white gap-4">
         <Loader2 className="w-10 h-10 animate-spin text-green-600"/>
         <p className="text-gray-500 text-sm font-medium animate-pulse">
           {dataLoading ? "Sohbet odaları yükleniyor..." : "Bağlantı kuruluyor..."}
         </p>
         <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-600 mt-4 underline">İptal ve Çıkış</button>
       </div>
     );
  }

  // 4. Main Chat Interface
  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      
      {/* Left Sidebar */}
      <aside className="hidden md:flex w-20 bg-white border-r border-gray-100 flex-col items-center py-6 gap-8 shrink-0 z-30">
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-md shadow-green-200 cursor-pointer hover:scale-105 transition-transform">
           <span className="text-white font-bold text-xl">W</span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-6 w-full px-3 mt-4 items-center">
           <SidebarIcon icon={<LayoutGrid size={22} />} active={false} label="Dashboard" />
           <SidebarIcon icon={<MessageSquare size={22} />} active={true} label="Odalar" />
           <SidebarIcon icon={<Users size={22} />} active={false} label="Üyeler" />
           <SidebarIcon icon={<Settings size={22} />} active={false} label="Ayarlar" />
        </nav>

        <div className="mb-4">
             <div 
               onClick={handleLogout}
               className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
               title="Çıkış Yap"
             >
                <LogOut size={20} />
             </div>
        </div>
      </aside>

      {/* Room List Panel (Mobile/Desktop) */}
      <div className={`
        fixed inset-0 z-40 bg-black/50 transition-opacity xl:hidden
        ${roomMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `} onClick={() => setRoomMenuOpen(false)}></div>

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 xl:translate-x-0 xl:relative xl:shadow-none xl:flex xl:flex-col xl:border-r xl:border-gray-100 xl:w-72 xl:z-auto
        ${roomMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
               <span className="text-green-600">WORKIGOM</span>
            </h1>
            <button onClick={() => setRoomMenuOpen(false)} className="xl:hidden p-2 text-gray-400 hover:text-gray-600">
               <LogOut className="w-5 h-5 rotate-180"/>
            </button>
         </div>

         <div className="p-3">
             <div className="relative">
               <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
               <input 
                 type="text" 
                 placeholder="Ara..." 
                 className="w-full bg-gray-50 border-none rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-green-100 transition-all"
               />
             </div>
         </div>

         <div className="flex-1 overflow-y-auto px-2 py-2">
            <div className="px-3 mb-2 mt-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
               <Folder size={12} /> Odalar
            </div>
            {rooms.map(room => (
              <RoomItem 
                key={room.id}
                room={room}
                active={activeRoomId === room.id}
                onClick={() => handleSwitchRoom(room.id)}
              />
            ))}
         </div>
      </div>

      {/* Main Chat Area */}
      <main className="flex-1 flex relative bg-white min-w-0 overflow-hidden">
        
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          
          {/* Header */}
          <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
             <div className="flex items-center gap-3 md:gap-4">
                <button onClick={() => setRoomMenuOpen(true)} className="xl:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg">
                   <Menu className="w-6 h-6" />
                </button>

                <div className="hidden md:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setRoomMenuOpen(!roomMenuOpen)}>
                   {activeRoom.type === 'private' ? (
                     <Unlock className="w-4 h-4 text-green-500" />
                   ) : (
                     <Folder className="w-4 h-4 text-orange-500 fill-orange-500/20" />
                   )}
                   <span className="text-sm font-semibold text-gray-700">
                     {activeRoom.type === 'private' ? 'Özel Mesaj' : 'Odalar'}
                   </span>
                   <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>

                <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                <div className="flex flex-col min-w-0">
                   <h2 className="font-bold text-gray-900 text-base md:text-lg leading-tight flex items-center gap-2 truncate">
                      <span className="text-green-500">#</span> <span className="truncate">{activeRoom.name}</span>
                      {activeRoom.type === 'private' && isCurrentChatBlocked && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Engellendi</span>
                      )}
                   </h2>
                </div>
             </div>
             
             {/* Header Controls */}
             <div className="flex items-center gap-2 md:gap-3">
                 
                 {activeRoom.type === 'private' && (
                   <button
                     onClick={toggleBlockUser}
                     className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                       ${isCurrentChatBlocked 
                         ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                         : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                   >
                      <UserMinus size={16} />
                      {isCurrentChatBlocked ? "Engeli Kaldır" : "Engelle"}
                   </button>
                 )}

                 <button
                    onClick={() => setAllowDMs(!allowDMs)}
                    className={`hidden md:flex p-2 rounded-full transition-colors relative
                      ${allowDMs ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}
                 >
                    {allowDMs ? <Mail size={20} /> : <MailWarning size={20} />}
                    <span className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${allowDMs ? 'bg-green-500' : 'bg-red-500'}`}></span>
                 </button>

                 <button 
                   onClick={() => setUserListOpen(!userListOpen)} 
                   className={`lg:hidden p-2 rounded-lg transition-colors ${userListOpen ? 'bg-green-50 text-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
                 >
                    <Users className="w-6 h-6" />
                 </button>

                 <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                       <img src={currentUser.avatar ? `${pb.baseUrl}/api/files/users/${currentUser.id}/${currentUser.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="Me" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">{currentUser.name || currentUser.username}</span>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 </div>
                 <button 
                   onClick={handleLogout}
                   className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-colors hidden md:block"
                   title="Çıkış Yap"
                 >
                    <LogOut className="w-5 h-5 rotate-180" />
                 </button>
             </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col relative bg-white">
              {isCurrentChatBlocked ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                  <UserMinus size={48} className="text-gray-300"/>
                  <p>Bu kullanıcıyı engellediniz. Mesaj gönderemez veya alamazsınız.</p>
                  <button onClick={toggleBlockUser} className="text-green-600 hover:underline">Engeli Kaldır</button>
                </div>
              ) : (
                <ChatModule 
                  key={activeRoomId}
                  roomName={activeRoom.name} 
                  messages={activeRoomMessages}
                  currentUser={currentUser}
                  activeRoomId={activeRoomId}
                />
              )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`
           fixed inset-0 z-30 bg-black/20 lg:hidden transition-opacity
           ${userListOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `} onClick={() => setUserListOpen(false)}></div>

        <aside className={`
            fixed inset-y-0 right-0 z-40 bg-white border-l border-gray-100 flex-col shrink-0 transition-transform duration-300
            w-60 lg:w-80 lg:relative lg:translate-x-0 lg:flex
            ${userListOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:shadow-none'}
        `}>
            
            <div className="p-4 lg:p-6 h-full overflow-y-auto">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">ÜYELER ({activeParticipants.length})</h3>
                  <button onClick={() => setUserListOpen(false)} className="lg:hidden text-gray-400">
                    <X size={18} />
                  </button>
               </div>
               
               <div className="space-y-3 lg:space-y-4">
                  <div className="bg-green-50/50 rounded-xl p-2 lg:p-3 border border-green-100 flex items-center gap-2 lg:gap-3">
                      <div className="relative">
                         <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                            <img src={currentUser.avatar ? `${pb.baseUrl}/api/files/users/${currentUser.id}/${currentUser.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="Me" className="w-full h-full object-cover" />
                         </div>
                         <div className="absolute bottom-0 right-0 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="min-w-0">
                         <div className="text-xs lg:text-sm font-bold text-gray-900 truncate">{currentUser.name || currentUser.username} (Sen)</div>
                         <div className="text-[10px] lg:text-xs text-green-600">Çevrimiçi</div>
                      </div>
                  </div>

                  {activeParticipants.filter(u => u.id !== currentUser.id).map(user => (
                     <UserListRow 
                        key={user.id} 
                        user={user} 
                        onDoubleClick={() => handleUserDoubleClick(user.id)}
                     />
                  ))}
               </div>
            </div>
        </aside>
      </main>
    </div>
  );
};

// --- Helper Components ---

interface SidebarIconProps {
  icon: React.ReactNode;
  active: boolean;
  label: string;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, active, label }) => (
  <button 
    title={label}
    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative
      ${active ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
  >
    {icon}
    <span className="absolute left-12 bg-gray-900 text-white text-[11px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
      {label}
    </span>
  </button>
);

interface RoomItemProps {
  room: Room;
  active: boolean;
  onClick: () => void;
}

const RoomItem: React.FC<RoomItemProps> = ({ room, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 mb-1 border-l-2
      ${active 
        ? 'bg-green-50 border-l-green-500 text-green-900' 
        : 'border-l-transparent text-gray-600 hover:bg-gray-50'}`}
  >
     <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 
        ${active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
        {room.type === 'private' ? <Lock size={14} /> : <Hash size={16} />}
     </div>
     <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium truncate ${active ? 'font-bold' : ''}`}>{room.name}</h4>
     </div>
  </div>
);

interface UserListRowProps {
  user: User;
  onDoubleClick: () => void;
}

const UserListRow: React.FC<UserListRowProps> = ({ user, onDoubleClick }) => (
  <div 
    onDoubleClick={onDoubleClick}
    title="Özel mesaj için çift tıkla"
    className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group select-none"
  >
    <div className="relative shrink-0">
      <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm overflow-hidden bg-gray-100 border border-gray-100`}>
         {user.isBot ? (
            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=Workigom&backgroundColor=transparent`} alt="Bot" className="w-full h-full" />
         ) : (
             <img src={user.avatar ? `${pb.baseUrl}/api/files/users/${user.id}/${user.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
         )}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
         <h4 className="text-xs lg:text-sm font-semibold text-gray-700 group-hover:text-gray-900 truncate">{user.name || user.username}</h4>
         {user.isBot && <span className="text-[8px] lg:text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">AI</span>}
      </div>
      <p className="text-[10px] lg:text-xs text-gray-400 truncate">{user.email}</p>
    </div>
  </div>
);

export default App;
