import React, { useState, useEffect, useRef } from 'react';
import ChatModule from './components/ChatWidget';
import AuthModal from './components/AuthModal'; // LandingPage import removed
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
  // showAuthModal removed as it is now default view for guests

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
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (e) {
        console.warn("Failed to fetch users, using demo user list");
        setUsers([
           { id: 'u1', username: 'demo_user', name: 'Demo User', email: 'demo@test.com', created: '', updated: '', collectionId: '', collectionName: '' }
        ]);
      }

      // Fetch Blocked Users
      if (pb.authStore.model) {
        try {
          const blocks = await getBlockedUsers(pb.authStore.model.id);
          setBlockedUserIds(new Set(blocks));
        } catch (e) {
          console.warn("Blocks fetch failed");
        }
      }

      // Fetch Rooms
      try {
        const roomsData = await getPublicRooms();
        if (roomsData.length > 0) {
          setRooms(roomsData);
          handleSwitchRoom(roomsData[0].id, roomsData);
        } else {
           // Fallback if empty array returned
           throw new Error("No rooms found");
        }
      } catch (e) {
         console.warn("Backend 404/Error on rooms, falling back to Demo Mode.");
         const demoRooms: Room[] = [
             { id: 'demo_genel', name: 'Genel Sohbet', topic: 'Herkesin buluşma noktası', type: 'public', participants: [], active: true, created: '', updated: '', collectionId: '', collectionName: '' },
             { id: 'demo_yazilim', name: 'Yazılım', topic: 'Kodlama ve teknoloji', type: 'public', participants: [], active: true, created: '', updated: '', collectionId: '', collectionName: '' }
         ];
         setRooms(demoRooms);
         handleSwitchRoom(demoRooms[0].id, demoRooms);
      }

    } catch (err: any) {
      console.error("Critical failure in loading app data", err);
      setDataError("Uygulama verileri yüklenemedi. (Backend bağlantı hatası)");
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
    }).catch(() => {
       // Demo messages
       setActiveRoomMessages([
          { id: 'm1', content: 'Workigom Chat sistemine hoş geldiniz! (Demo Modu)', role: Role.SYSTEM, room_id: activeRoomId, user_id: 'system', created: new Date().toISOString(), updated: '', collectionId: '', collectionName: '' }
       ]);
    });

    // Subscribe
    try {
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
    } catch(e) {
        console.warn("Realtime subscription failed (expected in demo mode)");
    }

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
      // Demo fallback
      const demoDmId = `dm_${targetUserId}`;
      const demoRoom: Room = { id: demoDmId, name: targetUser?.name || 'User', topic: 'DM', type: 'private', participants: [currentUser.id, targetUserId], active: true, created: '', updated: '', collectionId: '', collectionName: '' };
      setRooms(prev => [...prev, demoRoom]);
      handleSwitchRoom(demoDmId);
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

  // 1. Not Logged In -> Show STANDALONE Login Screen (Replaced Landing Page)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-workigom-green/5 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[128px] pointer-events-none"></div>
        
        {/* Direct Login Form */}
        <AuthModal isOpen={true} onClose={() => {}} isStandalone={true} />
        
        <div className="absolute bottom-6 text-center text-[10px] text-gray-600 font-mono tracking-widest uppercase">
          Workigom Chat System v1.2
        </div>
      </div>
    );
  }

  // 2. Data Error State
  if (dataError) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-workigom-dark text-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Hata Oluştu</h2>
        <p className="text-gray-400 mb-6">{dataError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-workigom-green text-black font-bold rounded-lg hover:bg-green-400 transition-colors"
        >
          Sayfayı Yenile
        </button>
        <button 
          onClick={handleLogout}
          className="mt-4 text-sm text-gray-500 hover:text-white"
        >
          Çıkış Yap
        </button>
      </div>
    );
  }

  // 3. Logged In but loading room -> Loading Spinner
  if (!activeRoom) {
     return (
       <div className="flex flex-col h-screen items-center justify-center bg-workigom-dark gap-4">
         <Loader2 className="w-10 h-10 animate-spin text-workigom-green"/>
         <p className="text-gray-400 text-sm font-medium animate-pulse">
           {dataLoading ? "Sohbet odaları yükleniyor..." : "Bağlantı kuruluyor..."}
         </p>
         <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-500 mt-4 underline">İptal ve Çıkış</button>
       </div>
     );
  }

  // 4. Main Chat Interface
  return (
    <div className="flex h-screen bg-workigom-dark text-slate-200 font-sans overflow-hidden">
      
      {/* Left Sidebar */}
      <aside className="hidden md:flex w-20 bg-[#0f0f12] border-r border-workigom-border flex-col items-center py-6 gap-8 shrink-0 z-30">
        <div className="w-10 h-10 bg-workigom-green rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,255,157,0.3)] cursor-pointer hover:scale-105 transition-transform">
           <span className="text-black font-bold text-xl">W</span>
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
               className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
               title="Çıkış Yap"
             >
                <LogOut size={20} />
             </div>
        </div>
      </aside>

      {/* Room List Panel (Mobile/Desktop) */}
      <div className={`
        fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity xl:hidden
        ${roomMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `} onClick={() => setRoomMenuOpen(false)}></div>

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0f0f12] border-r border-workigom-border shadow-2xl transform transition-transform duration-300 xl:translate-x-0 xl:relative xl:shadow-none xl:flex xl:flex-col xl:w-72 xl:z-auto
        ${roomMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         <div className="p-5 border-b border-workigom-border flex items-center justify-between">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
               <span className="text-workigom-green">WORKIGOM</span>
            </h1>
            <button onClick={() => setRoomMenuOpen(false)} className="xl:hidden p-2 text-gray-400 hover:text-white">
               <LogOut className="w-5 h-5 rotate-180"/>
            </button>
         </div>

         <div className="p-3">
             <div className="relative">
               <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
               <input 
                 type="text" 
                 placeholder="Oda ara..." 
                 className="w-full bg-black/20 border border-workigom-border rounded-lg py-2 pl-9 pr-4 text-sm text-gray-300 focus:ring-1 focus:ring-workigom-green focus:border-workigom-green transition-all placeholder-gray-600"
               />
             </div>
         </div>

         <div className="flex-1 overflow-y-auto px-2 py-2">
            <div className="px-3 mb-2 mt-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
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
      <main className="flex-1 flex relative bg-workigom-dark min-w-0 overflow-hidden">
        
        <div className="flex-1 flex flex-col min-w-0 bg-workigom-dark">
          
          {/* Header */}
          <div className="h-16 bg-[#0f0f12]/80 backdrop-blur-md border-b border-workigom-border flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
             <div className="flex items-center gap-3 md:gap-4">
                <button onClick={() => setRoomMenuOpen(true)} className="xl:hidden p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                   <Menu className="w-6 h-6" />
                </button>

                <div className="hidden md:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setRoomMenuOpen(!roomMenuOpen)}>
                   {activeRoom.type === 'private' ? (
                     <Unlock className="w-4 h-4 text-workigom-green" />
                   ) : (
                     <Folder className="w-4 h-4 text-orange-500" />
                   )}
                   <span className="text-sm font-semibold text-gray-300">
                     {activeRoom.type === 'private' ? 'Özel Mesaj' : 'Odalar'}
                   </span>
                   <ChevronDown className="w-3 h-3 text-gray-500" />
                </div>

                <div className="h-6 w-px bg-white/10 hidden md:block"></div>

                <div className="flex flex-col min-w-0">
                   <h2 className="font-bold text-white text-base md:text-lg leading-tight flex items-center gap-2 truncate">
                      <span className="text-workigom-green">#</span> <span className="truncate">{activeRoom.name}</span>
                      {activeRoom.type === 'private' && isCurrentChatBlocked && (
                        <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20">Engellendi</span>
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
                         ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                         : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                   >
                      <UserMinus size={16} />
                      {isCurrentChatBlocked ? "Engeli Kaldır" : "Engelle"}
                   </button>
                 )}

                 <button
                    onClick={() => setAllowDMs(!allowDMs)}
                    className={`hidden md:flex p-2 rounded-full transition-colors relative
                      ${allowDMs ? 'text-workigom-green bg-workigom-green/10' : 'text-gray-500 bg-white/5'}`}
                 >
                    {allowDMs ? <Mail size={20} /> : <MailWarning size={20} />}
                    <span className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0f0f12] ${allowDMs ? 'bg-green-500' : 'bg-red-500'}`}></span>
                 </button>

                 <button 
                   onClick={() => setUserListOpen(!userListOpen)} 
                   className={`lg:hidden p-2 rounded-lg transition-colors ${userListOpen ? 'bg-workigom-green/10 text-workigom-green' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                 >
                    <Users className="w-6 h-6" />
                 </button>

                 <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                       <img src={currentUser.avatar ? `${pb.baseUrl}/api/files/users/${currentUser.id}/${currentUser.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="Me" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-gray-300 hidden sm:block">{currentUser.name || currentUser.username}</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 box-content border-2 border-[#0f0f12]"></span>
                 </div>
                 <button 
                   onClick={handleLogout}
                   className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full p-2 transition-colors hidden md:block"
                   title="Çıkış Yap"
                 >
                    <LogOut className="w-5 h-5 rotate-180" />
                 </button>
             </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col relative bg-workigom-dark">
              {isCurrentChatBlocked ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
                  <UserMinus size={48} className="text-gray-700"/>
                  <p>Bu kullanıcıyı engellediniz. Mesaj gönderemez veya alamazsınız.</p>
                  <button onClick={toggleBlockUser} className="text-workigom-green hover:underline">Engeli Kaldır</button>
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
           fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity
           ${userListOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `} onClick={() => setUserListOpen(false)}></div>

        <aside className={`
            fixed inset-y-0 right-0 z-40 bg-[#0f0f12] border-l border-workigom-border flex-col shrink-0 transition-transform duration-300
            w-60 lg:w-80 lg:relative lg:translate-x-0 lg:flex
            ${userListOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:shadow-none'}
        `}>
            
            <div className="p-4 lg:p-6 h-full overflow-y-auto">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider">ÜYELER ({activeParticipants.length})</h3>
                  <button onClick={() => setUserListOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                    <X size={18} />
                  </button>
               </div>
               
               <div className="space-y-3 lg:space-y-4">
                  <div className="bg-workigom-green/10 rounded-xl p-2 lg:p-3 border border-workigom-green/20 flex items-center gap-2 lg:gap-3">
                      <div className="relative">
                         <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-workigom-green shadow-sm">
                            <img src={currentUser.avatar ? `${pb.baseUrl}/api/files/users/${currentUser.id}/${currentUser.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="Me" className="w-full h-full object-cover" />
                         </div>
                         <div className="absolute bottom-0 right-0 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 border-2 border-[#0f0f12] rounded-full"></div>
                      </div>
                      <div className="min-w-0">
                         <div className="text-xs lg:text-sm font-bold text-white truncate">{currentUser.name || currentUser.username} (Sen)</div>
                         <div className="text-[10px] lg:text-xs text-workigom-green">Çevrimiçi</div>
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
      ${active ? 'bg-workigom-green/10 text-workigom-green shadow-[0_0_10px_rgba(0,255,157,0.1)]' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
  >
    {icon}
    <span className="absolute left-12 bg-gray-900 text-white text-[11px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md border border-gray-800">
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
        ? 'bg-workigom-green/5 border-l-workigom-green text-workigom-green' 
        : 'border-l-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
  >
     <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 
        ${active ? 'bg-workigom-green/20 text-workigom-green' : 'bg-white/5 text-gray-600'}`}>
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
    className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group select-none"
  >
    <div className="relative shrink-0">
      <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm overflow-hidden bg-gray-800 border border-gray-700`}>
         {user.isBot ? (
            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=Workigom&backgroundColor=transparent`} alt="Bot" className="w-full h-full" />
         ) : (
             <img src={user.avatar ? `${pb.baseUrl}/api/files/users/${user.id}/${user.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
         )}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
         <h4 className="text-xs lg:text-sm font-semibold text-gray-400 group-hover:text-white truncate">{user.name || user.username}</h4>
         {user.isBot && <span className="text-[8px] lg:text-[9px] bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded font-bold border border-orange-500/20">AI</span>}
      </div>
      <p className="text-[10px] lg:text-xs text-gray-600 truncate group-hover:text-gray-500">{user.email}</p>
    </div>
  </div>
);

export default App;