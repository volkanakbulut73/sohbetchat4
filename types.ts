
export enum Role {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant'
}

export interface BaseRecord {
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
}

export interface Message extends BaseRecord {
  text: string;          
  room: string;          
  senderId: string;      
  senderName: string;    
  senderAvatar: string;  
  isUser: boolean;       
  type: string;          
  
  image?: string;
  audio?: string;
  
  color?: string; 
}

export interface User extends BaseRecord {
  username: string;
  email: string;
  name: string;
  avatar?: string;
  status?: string;
  isOnline?: boolean;
  isBot?: boolean;
  color?: string;
}

// Updated Room definition based on screenshot
export interface Room extends BaseRecord {
  // DB Fields
  room_id: string;      // "room_china" etc.
  is_muted: boolean;
  ai_typing: boolean;
  ai_user_id: string;

  // UI Derived Fields (mapped from DB or defaults)
  name?: string;
  topic?: string;
  type?: 'public' | 'private';
  participants?: string[];
  active?: boolean;
  
  // Legacy support
  otherUserId?: string;
}

export interface RoomState extends BaseRecord {
  room_id: string;
  is_muted: boolean;
  ai_typing: boolean;
  ai_user_id: string;
}

export interface BannedUser extends BaseRecord {
  user_id: string;
  target_user_id: string;
  room_id?: string;
}
