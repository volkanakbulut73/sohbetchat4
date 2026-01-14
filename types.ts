
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
  text: string;          // was content
  room: string;          // was room_id
  senderId: string;      // was user_id
  senderName: string;    // Denormalized name
  senderAvatar: string;  // Denormalized avatar filename
  isUser: boolean;       // true if user, false if AI/System
  type: string;          // 'user', 'assistant', 'system' etc.
  
  // Optional media fields from DB
  image?: string;
  audio?: string;
  
  // UI helpers
  color?: string; // Kept for UI consistency if needed, though not in DB screenshot explicitly, usually handled via type/isUser
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

export interface Room extends BaseRecord {
  name: string;
  topic: string;
  active: boolean;
  type: 'public' | 'private';
  participants: string[];
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
