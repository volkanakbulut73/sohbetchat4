import React, { useState, useEffect, useRef } from 'react';
import ChatModule from './components/ChatWidget';
import AuthModal from './components/AuthModal';
import { LayoutGrid, MessageSquare, Users, Settings, LogOut, Search, Menu, Hash, Folder, ChevronDown, X, Lock, Unlock, Mail, MailWarning, UserMinus, Loader2, AlertCircle, LogIn } from 'lucide-react';
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

const GUEST_USER: User = { 
  id: 'guest', 
  username: 'misafir', 
  name: 'Misafir Kullanıcı', 
  email: 'guest@workigom.com', 
  created: new Date().toISOString(), 
  updated: new Date().toISOString(), 
  collectionId: '', 
  collectionName: '',
  isBot: false
};

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<any>(getCurrentUser() || GUEST_USER);
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

  // Refs
  const activeRoomIdRef = useRef<string>('');

  // 1. Initial Load & Auth Check
  useEffect(() => {
    loadAppData();

    const removeListener = pb.authStore.onChange((token, model) => {
      setCurrentUser(model || GUEST_USER);
      
      if (model) {
        setShowAuthModal(false);
        loadAppData();
      } else {
        // Reset state on logout but keep Guest active
        setRooms([]);
        setUsers([]);
        setActiveRoomMessages([]);
        setActiveRoomId('');
        setDataError(null);
        loadAppData();
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  // 2. Load Data
  const loadAppData = async () => {
    setDataLoading(true);
    setDataError(null);
    
    // DEMO DATA FALLBACK
    const demoRooms: Room[] = [
        { id: 'demo_genel', name: 'Genel Sohbet', topic: 'Herkesin buluşma noktası', type: 'public', participants: [], active: true, created: '', updated: '', collectionId: '', collectionName: '' },
        { id: 'demo_yazilim', name: 'Yazılım', topic: 'Kodlama ve teknoloji', type: 'public', participants: [], active: true, created: '', updated: '', collectionId: '', collectionName: '' },
        { id: 'demo_muzik', name: 'Müzik & Sanat', topic: 'Sanat üzerine', type: 'public', participants: [], active: true, created: '', updated: '', collectionId: '', collectionName: '' }
    ];

    try {
      // Fetch Users
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (e) {
        setUsers([
           { id: 'u1', username: 'demo_user', name: 'Demo User', email: 'demo@test.com', created: '', updated: '', collectionId: '', collectionName: '' }
        ]);
      }

      // Fetch Blocked Users
      if (pb.authStore.model) {
        try {
          const blocks = await getBlockedUsers(pb.authStore.model.id);
          setBlockedUserIds(new Set(blocks));
        } catch (e) {}
      }

      // Fetch Rooms
      try {
        const roomsData = await getPublicRooms();
        if (roomsData && roomsData.length > 0) {
          setRooms(roomsData);
          handleSwitchRoom(roomsData[0].id, roomsData);
        } else {
           // Fallback if empty array returned
           setRooms(demoRooms);
           handleSwitchRoom(demoRooms[0].id, demoRooms);
        }
      } catch (e) {
         // Fallback if fetch failed (404 etc)
         setRooms(demoRooms);
         handleSwitchRoom(demoRooms[0].id, demoRooms);
      }

    } catch (err: any) {
      // Catastrophic failure fallback
      setRooms(demoRooms);
      handleSwitchRoom(demoRooms[0].id, demoRooms);
    } finally {
      setDataLoading(false);
    }
  };

  // 3. Realtime Chat Subscription
  useEffect(() => {
    if (!activeRoomId) return;

    // Skip backend logic for demo rooms
    if (activeRoomId.startsWith('demo_')) {
      setActiveRoomMessages([
          { 
            id: 'm1', 
            text: 'Workigom Chat sistemine hoş geldiniz!', 
            type: Role.SYSTEM, 
            room: activeRoomId, 
            senderId: 'system', 
            senderName: 'Sistem',
            senderAvatar: '',
            isUser: false,
            created: new Date().toISOString(), 
            updated: '', 
            collectionId: '', 
            collectionName: '' 
          }
      ]);
      return;
    }

    // Load history
    getMessages(activeRoomId).then(msgs => {
      setActiveRoomMessages(msgs);
    }).catch(() => {
       setActiveRoomMessages([
          { 
            id: 'm1', 
            text: 'Sohbet geçmişi yüklenemedi.', 
            type: Role.SYSTEM, 
            room: activeRoomId, 
            senderId: 'system', 
            senderName: 'Sistem',
            senderAvatar: '',
            isUser: false,
            created: new Date().toISOString(), 
            updated: '', 
            collectionId: '', 
            collectionName: '' 
          }
       ]);
    });

    // Subscribe
    try {
        unsubscribeFromRoom();
        subscribeToRoom(activeRoomId, (newMessage) => {
          setActiveRoomMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        });
    } catch(e) {
        // console.warn("Realtime subscription failed");
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

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  const handleUserDoubleClick = async (targetUserId: string) => {
    if (currentUser.id === 'guest') {
      alert("Özel mesaj göndermek için giriş yapmalısınız.");
      return;
    }
    
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
      const demoDmId = `dm_${targetUserId}`;
      const demoRoom: Room = { id: demoDmId, name: targetUser?.name || 'User', topic: 'DM', type: 'private', participants: [currentUser.id, targetUserId], active: true, created: '', updated: '', collectionId: '', collectionName: '' };
      setRooms(prev => [...prev, demoRoom]);
      handleSwitchRoom(demoDmId);
    }
  };

  const toggleBlockUser = async () => {
    if (currentUser.id === 'guest') return;

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
    } catch (e) {}
  };

  const isCurrentChatBlocked = React.useMemo(() => {
      if (!activeRoom || activeRoom.type !== 'private' || !currentUser) return false;
      const otherId = activeRoom.participants.find(id => id !== currentUser.id);
      return otherId ? blockedUserIds.has(otherId) : false;
  }, [activeRoom, blockedUserIds, currentUser]);

  // --- RENDER LOGIC ---
  
  if (dataError && rooms.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50 text-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Hata Oluştu</h2>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">Yenile</button>
      </div>
    );
  }

  // Loading State
  if (!activeRoom) {
     return (
       <div className="flex flex-col h-screen items-center justify-center bg-gray-50 gap-4">
         <Loader2 className="w-10 h-10 animate-spin text-workigom-green"/>
         <p className="text-gray-500 text-sm font-medium animate-pulse">Bağlantı kuruluyor...</p>
       </div>
     );
  }

  // Main Chat Interface (LIGHT MODE)
  return (
    <div className="flex h-screen bg-gray-50 text-slate-800 font-sans overflow-hidden">
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Left Sidebar (Light) */}
      <aside className="hidden md:flex w-20 bg-white border-r border-gray-200 flex-col items-center py-6 gap-8 shrink-0 z-30">
        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg shadow-gray-200 cursor-pointer hover:scale-105 transition-transform">
           <span className="font-bold text-xl">W</span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-6 w-full px-3 mt-4 items-center">
           <SidebarIcon icon={<LayoutGrid size={22} />} active={false} label="Dashboard" />
           <SidebarIcon icon={<MessageSquare size={22} />} active={true} label="Odalar" />
           <SidebarIcon icon={<Users size={22} />} active={false} label="Üyeler" />
           <SidebarIcon icon={<Settings size={22} />} active={false} label="Ayarlar" />
        </nav>

        <div className="mb-4">
             {currentUser.id !== 'guest' ? (
               <div onClick={handleLogout} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer" title="Çıkış Yap">
                  <LogOut size={20} />
               </div>
             ) : (
                <div onClick={handleLoginClick} className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors cursor-pointer" title="Giriş Yap">
                  <LogIn size={20} />
               </div>
             )}
        </div>
      </aside>

      {/* Room List Panel (Light) */}
      <div className={`
        fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity xl:hidden
        ${roomMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `} onClick={() => setRoomMenuOpen(false)}></div>

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-2xl transform transition-transform duration-300 xl:translate-x-0 xl:relative xl:shadow-none xl:flex xl:flex-col xl:w-72 xl:z-auto
        ${roomMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">WORKIGOM</h1>
            <button onClick={() => setRoomMenuOpen(false)} className="xl:hidden p-2 text-gray-400 hover:text-gray-900">
               <LogOut className="w-5 h-5 rotate-180"/>
            </button>
         </div>

         <div className="p-3">
             <div className="relative">
               <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
               <input type="text" placeholder="Oda ara..." className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-700 focus:ring-1 focus:ring-black focus:border-black transition-all placeholder-gray-400"/>
             </div>
         </div>

         <div className="flex-1 overflow-y-auto px-2 py-2">
            <div className="px-3 mb-2 mt-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
               <Folder size={12} /> Odalar
            </div>
            {rooms.map(room => (
              <RoomItem key={room.id} room={room} active={activeRoomId === room.id} onClick={() => handleSwitchRoom(room.id)} />
            ))}
         </div>
      </div>

      {/* Main Chat Area (Light) */}
      <main className="flex-1 flex relative bg-gray-50 min-w-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
          
          {/* Header */}
          <div className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
             <div className="flex items-center gap-3 md:gap-4">
                <button onClick={() => setRoomMenuOpen(true)} className="xl:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                   <Menu className="w-6 h-6" />
                </button>

                <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setRoomMenuOpen(!roomMenuOpen)}>
                   {activeRoom.type === 'private' ? <Unlock className="w-4 h-4 text-green-600" /> : <Folder className="w-4 h-4 text-orange-500" />}
                   <span className="text-sm font-semibold text-gray-700">{activeRoom.type === 'private' ? 'Özel Mesaj' : 'Odalar'}</span>
                   <ChevronDown className="w-3 h-3 text-gray-500" />
                </div>

                <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                <div className="flex flex-col min-w-0">
                   <h2 className="font-bold text-gray-900 text-base md:text-lg leading-tight flex items-center gap-2 truncate">
                      <span className="text-green-500">#</span> <span className="truncate">{activeRoom.name}</span>
                   </h2>
                </div>
             </div>
             
             <div className="flex items-center gap-2 md:gap-3">
                 {activeRoom.type === 'private' && (
                   <button onClick={toggleBlockUser} className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isCurrentChatBlocked ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600'}`}>
                      <UserMinus size={16} />
                      {isCurrentChatBlocked ? "Engeli Kaldır" : "Engelle"}
                   </button>
                 )}

                 <button onClick={() => setAllowDMs(!allowDMs)} className={`hidden md:flex p-2 rounded-full transition-colors relative ${allowDMs ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                    {allowDMs ? <Mail size={20} /> : <MailWarning size={20} />}
                 </button>

                 <button onClick={() => setUserListOpen(!userListOpen)} className={`lg:hidden p-2 rounded-lg transition-colors ${userListOpen ? 'bg-green-50 text-green-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                    <Users className="w-6 h-6" />
                 </button>

                 <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                       <img src={currentUser.avatar ? `${pb.baseUrl}/api/files/users/${currentUser.id}/${currentUser.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="Me" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">{currentUser.name || currentUser.username}</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 box-content border-2 border-white"></span>
                 </div>
                 
                 {currentUser.id !== 'guest' ? (
                   <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-colors hidden md:block">
                      <LogOut className="w-5 h-5 rotate-180" />
                   </button>
                 ) : (
                    <button onClick={handleLoginClick} className="text-green-600 hover:text-green-500 hover:bg-green-50 rounded-full p-2 transition-colors hidden md:block">
                      <LogIn className="w-5 h-5" />
                   </button>
                 )}
             </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col relative bg-gray-50">
              {isCurrentChatBlocked ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                  <UserMinus size={48} className="text-gray-300"/>
                  <p>Bu kullanıcıyı engellediniz.</p>
                  <button onClick={toggleBlockUser} className="text-black font-semibold hover:underline">Engeli Kaldır</button>
                </div>
              ) : (
                <ChatModule key={activeRoomId} roomName={activeRoom.name} messages={activeRoomMessages} currentUser={currentUser} activeRoomId={activeRoomId}/>
              )}
          </div>
        </div>

        {/* Right Sidebar (Light) */}
        <div className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity ${userListOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setUserListOpen(false)}></div>

        <aside className={`fixed inset-y-0 right-0 z-40 bg-white border-l border-gray-200 flex-col shrink-0 transition-transform duration-300 w-60 lg:w-80 lg:relative lg:translate-x-0 lg:flex ${userListOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:shadow-none'}`}>
            <div className="p-4 lg:p-6 h-full overflow-y-auto">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">ÜYELER ({activeParticipants.length})</h3>
                  <button onClick={() => setUserListOpen(false)} className="lg:hidden text-gray-500 hover:text-black"><X size={18} /></button>
               </div>
               
               <div className="space-y-3 lg:space-y-4">
                  <div className="bg-green-50 rounded-xl p-2 lg:p-3 border border-green-100 flex items-center gap-2 lg:gap-3">
                      <div className="relative">
                         <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
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
                     <UserListRow key={user.id} user={user} onDoubleClick={() => handleUserDoubleClick(user.id)} />
                  ))}
               </div>
            </div>
        </aside>
      </main>
    </div>
  );
};

// --- Helper Components ---

const SidebarIcon: React.FC<{ icon: React.ReactNode; active: boolean; label: string }> = ({ icon, active, label }) => (
  <button title={label} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${active ? 'bg-black text-white shadow-lg shadow-gray-300' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}>
    {icon}
    <span className="absolute left-12 bg-gray-900 text-white text-[11px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">{label}</span>
  </button>
);

const RoomItem: React.FC<{ room: Room; active: boolean; onClick: () => void }> = ({ room, active, onClick }) => (
  <div onClick={onClick} className={`px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 mb-1 border-l-2 ${active ? 'bg-gray-100 border-l-black text-black' : 'border-l-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
     <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-white text-black shadow-sm' : 'bg-gray-50 text-gray-400'}`}>
        {room.type === 'private' ? <Lock size={14} /> : <Hash size={16} />}
     </div>
     <div className="flex-1 min-w-0"><h4 className={`text-sm font-medium truncate ${active ? 'font-bold' : ''}`}>{room.name}</h4></div>
  </div>
);

const UserListRow: React.FC<{ user: User; onDoubleClick: () => void }> = ({ user, onDoubleClick }) => (
  <div onDoubleClick={onDoubleClick} title="Özel mesaj için çift tıkla" className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group select-none">
    <div className="relative shrink-0">
      <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm overflow-hidden bg-white border border-gray-200`}>
         {user.isBot ? <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=Workigom&backgroundColor=transparent`} alt="Bot" className="w-full h-full" /> : <img src={user.avatar ? `${pb.baseUrl}/api/files/users/${user.id}/${user.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
         <h4 className="text-xs lg:text-sm font-semibold text-gray-600 group-hover:text-gray-900 truncate">{user.name || user.username}</h4>
         {user.isBot && <span className="text-[8px] lg:text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold border border-orange-200">AI</span>}
      </div>
      <p className="text-[10px] lg:text-xs text-gray-400 truncate group-hover:text-gray-500">{user.email}</p>
    </div>
  </div>
);

export default App;
