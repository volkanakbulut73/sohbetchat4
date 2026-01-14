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
    // The new schema doesn't have a 'type' field, so we fetch all records from 'rooms'.
    // We assume these are the configured public rooms.
    const records = await pb.collection('rooms').getFullList({
      sort: '-created',
    });
    
    // Map the DB structure to our UI structure
    return records.map((r: any) => ({
        ...r,
        // Map 'room_id' (e.g. 'room_china') to display name
        name: r.room_id || 'İsimsiz Oda', 
        topic: 'Genel Sohbet',
        type: 'public',
        participants: [],
        active: true
    })) as Room[];

  } catch (e: any) {
    return [];
  }
};

export const getPrivateRoom = async (currentUserId: string, targetUserId: string): Promise<Room | null> => {
  // DB schema 'rooms' does not have 'participants' field anymore based on screenshot.
  // We return null to force fallback/demo mode for DMs or client-side handling.
  return null;
};

export const createPrivateRoom = async (currentUserId: string, targetUser: User): Promise<Room> => {
  // Since the backend 'rooms' collection lacks 'participants' and 'type',
  // we cannot create a functional persistent private room in the DB matching the App's logic.
  // We return a Mock Room object to allow the UI to open a temporary DM view.
  return {
      id: `dm_${currentUserId}_${targetUser.id}`,
      room_id: `dm_${currentUserId}_${targetUser.id}`,
      name: targetUser.name || targetUser.username,
      topic: 'Özel Sohbet',
      type: 'private',
      participants: [currentUserId, targetUser.id],
      active: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      collectionId: 'mock',
      collectionName: 'rooms',
      is_muted: false,
      ai_typing: false,
      ai_user_id: ''
  } as Room;
};

// --- MESSAGES ---

export const getMessages = async (roomId: string): Promise<Message[]> => {
  try {
      // We assume 'room' field in messages corresponds to the Room's Record ID
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
  userInfo?: { name: string; avatar: string }
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
    const data = {
      text: text,
      room: roomId,
      senderId: userId,
      senderName: senderName,
      senderAvatar: senderAvatar,
      isUser: isUser,
      type: role
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
