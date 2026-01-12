
export enum Role {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant'
}

export interface Message {
  role: Role;
  content: string;
  timestamp: number;
}

export interface ChatConfig {
  apiKey: string;
  model: string;
  temperature: number;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: string;
  isOnline: boolean;
  isBot?: boolean;
  color?: string;
}

export interface Room {
  id: string;
  name: string;
  topic: string;
  active: boolean;
  unreadCount: number;
  participants: string[]; // User IDs
}
