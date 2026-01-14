import PocketBase from 'pocketbase';
import { User, Message, Room, Role } from '../types';

// Use the specific HTTPS domain requested
const PB_URL = 'https://api.workigomchat.online';
export const pb = new PocketBase(PB_URL);

// Disable auto cancellation to prevent race conditions in UI effects
pb.autoCancellation(false);

// --- AUTH ---

export const loginWithEmail = async (email: string, password: string) => {
  return await pb.collection('users').authWithPassword(email, password);
};

export const logout = () => {
  pb.authStore.clear();
};

export const getCurrentUser = () => {
  return pb.authStore.model;
};

export const isAuthenticated = () => {
  return pb.authStore.isValid;
};

// --- USERS ---

export const getUsers = async (): Promise<User[]> => {
  try {
    const records = await pb.collection('users').getFullList({
      sort: '-created',
    });
    return records as unknown as User[];
  } catch (e) {
    return [];
  }
};

// --- ROOMS ---

export const getPublicRooms = async (): Promise<Room[]> => {
  try {
    const records = await pb.collection('rooms').getFullList({
      filter: 'type = "public"',
      sort: 'created',
    });
    return records as unknown as Room[];
  } catch (e: any) {
    return [];
  }
};

export const getPrivateRoom = async (currentUserId: string, targetUserId: string): Promise<Room | null> => {
  try {
      const records = await pb.collection('rooms').getList(1, 1, {
        filter: `type = "private" && participants ~ "${currentUserId}" && participants ~ "${targetUserId}"`,
      });
      
      if (records.items.length > 0) {
        return records.items[0] as unknown as Room;
      }
      return null;
  } catch (e) {
      return null;
  }
};

export const createPrivateRoom = async (currentUserId: string, targetUser: User): Promise<Room> => {
  try {
    const data = {
      name: targetUser.name || targetUser.username,
      topic: 'Özel Sohbet',
      type: 'private',
      participants: [currentUserId, targetUser.id],
      active: true
    };
    
    const record = await pb.collection('rooms').create(data);
    return record as unknown as Room;
  } catch (e) {
    throw e;
  }
};

// --- MESSAGES ---

export const getMessages = async (roomId: string): Promise<Message[]> => {
  try {
      // Filter updated to use 'room' instead of 'room_id'
      const records = await pb.collection('messages').getList(1, 50, {
        filter: `room = "${roomId}"`,
        sort: 'created', 
      });
      return records.items as unknown as Message[];
  } catch (e: any) {
      return [];
  }
};

export const sendMessageToPB = async (
  roomId: string, 
  text: string, 
  role: Role, 
  userId: string,
  userInfo?: { name: string; avatar: string } // Helper to populate denormalized fields
): Promise<Message> => {
  
  const isUser = role === Role.USER;
  const senderName = userInfo?.name || (isUser ? 'Kullanıcı' : 'Grok');
  const senderAvatar = userInfo?.avatar || '';

  // If in demo mode
  if (roomId.startsWith('demo_') || roomId.startsWith('dm_')) {
      return {
          id: 'demo_' + Math.random().toString(36).substr(2, 9),
          text,
          type: role,
          room: roomId,
          senderId: userId,
          senderName,
          senderAvatar,
          isUser,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          collectionId: 'demo',
          collectionName: 'messages'
      } as Message;
  }

  try {
    // New DB Structure Mapping
    const data = {
      text: text,
      room: roomId,
      senderId: userId,
      senderName: senderName,
      senderAvatar: senderAvatar,
      isUser: isUser,
      type: role // storing role as type (user, assistant, system)
    };
    
    const record = await pb.collection('messages').create(data);
    return record as unknown as Message;
  } catch (e) {
    // Fallback
    return {
          id: 'temp_error_' + Math.random().toString(36).substr(2, 9),
          text,
          type: role,
          room: roomId,
          senderId: userId,
          senderName,
          senderAvatar,
          isUser,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          collectionId: 'demo',
          collectionName: 'messages'
      } as Message;
  }
};

export const subscribeToRoom = (roomId: string, callback: (msg: Message) => void) => {
  if (roomId.startsWith('demo_') || roomId.startsWith('dm_')) return;

  try {
    return pb.collection('messages').subscribe('*', (e) => {
      // Updated check: e.record.room instead of e.record.room_id
      if (e.action === 'create' && e.record.room === roomId) {
          callback(e.record as unknown as Message);
      }
    });
  } catch (e) {
    // ignore
  }
};

export const unsubscribeFromRoom = () => {
  try {
    pb.collection('messages').unsubscribe();
  } catch (e) {
    // ignore
  }
};

// --- BLOCKS / BANS ---

export const getBlockedUsers = async (currentUserId: string): Promise<string[]> => {
  try {
    const records = await pb.collection('banned_users').getFullList({
        filter: `user_id = "${currentUserId}"`
    });
    return records.map((r: any) => r.target_user_id);
  } catch (e) {
    return [];
  }
};

export const blockUser = async (currentUserId: string, targetUserId: string) => {
  try {
    await pb.collection('banned_users').create({
      user_id: currentUserId,
      target_user_id: targetUserId
    });
  } catch (e) {}
};

export const unblockUser = async (currentUserId: string, targetUserId: string) => {
  try {
      const records = await pb.collection('banned_users').getList(1, 1, {
        filter: `user_id = "${currentUserId}" && target_user_id = "${targetUserId}"`
      });
      
      if (records.items.length > 0) {
        await pb.collection('banned_users').delete(records.items[0].id);
      }
  } catch (e) {
      console.error("Error unblocking user", e);
  }
};
