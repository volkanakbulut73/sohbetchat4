import React, { useState, useEffect } from 'react';
import ChatModule from './components/ChatWidget';
import { LayoutGrid, MessageSquare, Users, Settings, LogOut, Search, Menu, Hash, Folder, ChevronDown, X, LogIn } from 'lucide-react';
import { Room, User } from './types';

// --- MOCK DATA ---

const MOCK_USERS: Record<string, User> = {
  'me': { id: 'me', name: 'romance (Sen)', status: 'Çevrimiçi', isOnline: true, color: 'bg-blue-100 text-blue-600' },
  'bot': { id: 'bot', name: 'Workigom AI', status: 'Yapay Zeka', isOnline: true, isBot: true, color: 'bg-indigo-100 text-indigo-600' },
  'u1': { id: 'u1', name: 'Atlas', status: 'Bilge ve Felsefi', isOnline: true, color: 'bg-gray-200 text-gray-600' },
  'u2': { id: 'u2', name: 'Gölge', status: 'Şüpheci ve Eleştirel', isOnline: true, color: 'bg-gray-200 text-gray-600' },
  'u3': { id: 'u3', name: 'haso_ağa', status: 'Uzakta', isOnline: false, color: 'bg-yellow-100 text-yellow-700' },
  'u4': { id: 'u4', name: 'Moderatör', status: 'Oda Yöneticisi', isOnline: true, color: 'bg-red-100 text-red-700' },
};

const INITIAL_ROOMS: Room[] = [
  { id: 'general', name: 'Çin ile Ticaret', topic: 'İthalat, ihracat ve gümrük', active: true, unreadCount: 0, participants: ['me', 'bot', 'u1', 'u2', 'u3'] },
  { id: 'tech', name: 'Yazılım Dünyası', topic: 'Kodlama, AI ve Teknoloji', active: false, unreadCount: 2, participants: ['me', 'bot', 'u2'] },
  { id: 'music', name: 'Müzik Kutusu', topic: 'Ne dinliyorsun?', active: false, unreadCount: 0, participants: ['me', 'u1'] },
  { id: 'game', name: 'Oyun', topic: 'Oyun arkadaşı aranıyor', active: false, unreadCount: 0, participants: ['me', 'u3'] },
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Start as logged out
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>('general');
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);
  const [userListOpen, setUserListOpen] = useState(false);

  // Initialize login state to true for smoother dev experience, or false if we want strict login
  useEffect(() => {
    setIsLoggedIn(true);
  }, []);

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  // Get User objects for the active room
  const activeParticipants = activeRoom.participants
    .map(userId => MOCK_USERS[userId])
    .sort((a, b) => {
      // Put 'me' first
      if (a.id === 'me') return -1;
      if (b.id === 'me') return 1;
      return 0;
    });

  const handleSwitchRoom = (roomId: string) => {
    setRooms(prev => prev.map(r => ({ ...r, active: r.id === roomId })));
    setActiveRoomId(roomId);
    setRoomMenuOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRoomMenuOpen(false);
    setUserListOpen(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center animate-enter">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
            <span className="text-white font-bold text-4xl">W</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Workigom AI</h1>
          <p className="text-gray-500 mb-8">Sohbet odalarına katılmak için giriş yapın.</p>
          
          <button 
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      
      {/* --- 1. Left Sidebar (Icons) - Always visible on desktop --- */}
      <aside className="hidden md:flex w-20 bg-white border-r border-gray-100 flex-col items-center py-6 gap-8 shrink-0 z-30">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 cursor-pointer hover:scale-105 transition-transform">
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

      {/* --- 2. Room List Panel (Visible ONLY on XL screens, or via Drawer on smaller) --- */}
      {/* Backdrop for Rooms */}
      <div className={`
        fixed inset-0 z-40 bg-black/50 transition-opacity xl:hidden
        ${roomMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `} onClick={() => setRoomMenuOpen(false)}></div>

      {/* Rooms Drawer */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 xl:translate-x-0 xl:relative xl:shadow-none xl:flex xl:flex-col xl:border-r xl:border-gray-100 xl:w-72 xl:z-auto
        ${roomMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
               <span className="text-indigo-600">WORKIGOM</span>
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
                 className="w-full bg-gray-50 border-none rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-100 transition-all"
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

      {/* --- Main Layout Wrapper --- */}
      <main className="flex-1 flex relative bg-white min-w-0 overflow-hidden">
        
        {/* --- 3. Center Chat Area --- */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          
          {/* Header */}
          <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
             <div className="flex items-center gap-3 md:gap-4">
                {/* Mobile/Tablet Room Menu Trigger */}
                <button onClick={() => setRoomMenuOpen(true)} className="xl:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg">
                   <Menu className="w-6 h-6" />
                </button>

                {/* Breadcrumb / Room Selector look */}
                <div className="hidden md:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setRoomMenuOpen(!roomMenuOpen)}>
                   <Folder className="w-4 h-4 text-orange-500 fill-orange-500/20" />
                   <span className="text-sm font-semibold text-gray-700">Odalar</span>
                   <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>

                <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                <div className="flex flex-col min-w-0">
                   <h2 className="font-bold text-indigo-900 text-base md:text-lg leading-tight flex items-center gap-2 truncate">
                      <span className="text-indigo-500">#</span> <span className="truncate">{activeRoom.name}</span>
                   </h2>
                </div>
             </div>
             
             {/* Right Header Controls */}
             <div className="flex items-center gap-2 md:gap-3">
                 {/* Mobile User List Toggle */}
                 <button 
                   onClick={() => setUserListOpen(!userListOpen)} 
                   className={`lg:hidden p-2 rounded-lg transition-colors ${userListOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                 >
                    <Users className="w-6 h-6" />
                 </button>

                 <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${MOCK_USERS['me'].name}`} alt="Me" className="w-full h-full" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">romance</span>
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

          {/* Chat Module Container */}
          <div className="flex-1 overflow-hidden flex flex-col relative bg-white">
              <ChatModule 
                roomName={activeRoom.name} 
                accentColor="from-indigo-500 to-purple-600"
              />
          </div>
        </div>

        {/* --- 4. Right Sidebar (User List) --- */}
        {/* Mobile Backdrop for User List */}
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
                  <h3 className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">ÜYELER ({activeRoom.participants.length})</h3>
                  {/* Close button for mobile */}
                  <button onClick={() => setUserListOpen(false)} className="lg:hidden text-gray-400">
                    <X size={18} />
                  </button>
               </div>
               
               <div className="space-y-3 lg:space-y-4">
                  {/* Active User (Me) */}
                  <div className="bg-indigo-50/50 rounded-xl p-2 lg:p-3 border border-indigo-100 flex items-center gap-2 lg:gap-3">
                      <div className="relative">
                         <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=romance`} alt="Me" className="w-full h-full" />
                         </div>
                         <div className="absolute bottom-0 right-0 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="min-w-0">
                         <div className="text-xs lg:text-sm font-bold text-indigo-900 truncate">romance (Sen)</div>
                         <div className="text-[10px] lg:text-xs text-indigo-400">Çevrimiçi</div>
                      </div>
                  </div>

                  {/* Other Users */}
                  <div className="space-y-2 lg:space-y-3">
                     {activeParticipants.filter(u => u.id !== 'me').map(user => (
                        <UserListRow key={user.id} user={user} />
                     ))}
                  </div>
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
      ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
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
        ? 'bg-indigo-50 border-l-indigo-500 text-indigo-900' 
        : 'border-l-transparent text-gray-600 hover:bg-gray-50'}`}
  >
     <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 
        ${active ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
        <Hash size={16} />
     </div>
     <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium truncate ${active ? 'font-bold' : ''}`}>{room.name}</h4>
     </div>
  </div>
);

interface UserListRowProps {
  user: User;
}

const UserListRow: React.FC<UserListRowProps> = ({ user }) => (
  <div className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
    <div className="relative shrink-0">
      <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm overflow-hidden bg-gray-100 border border-gray-100`}>
         {user.isBot ? (
            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=Workigom&backgroundColor=transparent`} alt="Bot" className="w-full h-full" />
         ) : (
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full" />
         )}
      </div>
      {user.isOnline && !user.isBot && (
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
      {user.isBot && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 lg:w-3.5 lg:h-3.5 bg-orange-500 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-white rounded-full animate-pulse"></div>
          </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
         <h4 className="text-xs lg:text-sm font-semibold text-gray-700 group-hover:text-gray-900 truncate">{user.name}</h4>
         {user.isBot && <span className="text-[8px] lg:text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">AI</span>}
      </div>
      <p className="text-[10px] lg:text-xs text-gray-400 truncate">{user.status}</p>
    </div>
  </div>
);

export default App;