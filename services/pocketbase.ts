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
    // Suppress common fetch errors to avoid console noise
    // console.error("Error fetching users:", e);
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
    // Only log critical errors, ignore 404/Not Found for demo purposes
    if (e.status !== 404 && e.status !== 0) {
        console.error("Error fetching rooms", e);
    }
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
      // console.error("Error getting private room", e);
      return null;
  }
};

export const createPrivateRoom = async (currentUserId: string, targetUser: User): Promise<Room> => {
  const data = {
    name: targetUser.name || targetUser.username,
    topic: 'Özel Sohbet',
    type: 'private',
    participants: [currentUserId, targetUser.id],
    active: true
  };
  
  const record = await pb.collection('rooms').create(data);
  return record as unknown as Room;
};

// --- MESSAGES ---

export const getMessages = async (roomId: string): Promise<Message[]> => {
  try {
      const records = await pb.collection('messages').getList(1, 50, {
        filter: `room_id = "${roomId}"`,
        sort: 'created', 
        expand: 'user_id',
      });
      return records.items as unknown as Message[];
  } catch (e: any) {
      // Suppress 404/Error logs for demo/missing backend
      if (e.status !== 404 && e.status !== 0) {
         console.error("Error fetching messages", e);
      }
      return [];
  }
};

export const sendMessageToPB = async (
  roomId: string, 
  content: string, 
  role: Role, 
  userId: string,
  color?: string
): Promise<Message> => {
  
  // If in demo mode, pretend we sent it
  if (roomId.startsWith('demo_')) {
      return {
          id: 'demo_' + Math.random().toString(36).substr(2, 9),
          content,
          role,
          room_id: roomId,
          user_id: userId,
          color,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          collectionId: 'demo',
          collectionName: 'messages'
      } as Message;
  }

  const data = {
    content,
    role,
    room_id: roomId,
    user_id: userId,
    color
  };
  const record = await pb.collection('messages').create(data);
  return record as unknown as Message;
};

export const subscribeToRoom = (roomId: string, callback: (msg: Message) => void) => {
  return pb.collection('messages').subscribe('*', (e) => {
    if (e.action === 'create' && e.record.room_id === roomId) {
        callback(e.record as unknown as Message);
    }
  });
};

export const unsubscribeFromRoom = () => {
  pb.collection('messages').unsubscribe();
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
  await pb.collection('banned_users').create({
    user_id: currentUserId,
    target_user_id: targetUserId
  });
};

export const unblockUser = async (currentUserId: string, targetUserId: string) => {
  // Find the record first
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