import PocketBase from 'pocketbase';
import { User, Message, Room, Role } from '../types';

// Initialize the PocketBase client using the IP from your screenshot
const pb = new PocketBase('http://72.62.178.90:8090');

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
  const records = await pb.collection('users').getFullList({
    sort: '-created',
  });
  return records as unknown as User[];
};

// --- ROOMS ---

export const getPublicRooms = async (): Promise<Room[]> => {
  // Assuming you have a 'rooms' collection. 
  // If not, we might need to create records for the public rooms first.
  try {
    const records = await pb.collection('rooms').getFullList({
      filter: 'type = "public"',
      sort: 'created',
    });
    return records as unknown as Room[];
  } catch (e) {
    console.error("Error fetching rooms", e);
    return [];
  }
};

export const getPrivateRoom = async (currentUserId: string, targetUserId: string): Promise<Room | null> => {
  // Logic: Find a room where both users are participants and type is private
  // Note: PocketBase filtering on array fields needs simplified logic usually
  const records = await pb.collection('rooms').getList(1, 1, {
    filter: `type = "private" && participants ~ "${currentUserId}" && participants ~ "${targetUserId}"`,
  });
  
  if (records.items.length > 0) {
    return records.items[0] as unknown as Room;
  }
  return null;
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
  const records = await pb.collection('messages').getList(1, 50, {
    filter: `room_id = "${roomId}"`,
    sort: 'created', // Get oldest first for chat history
    expand: 'user_id',
  });
  return records.items as unknown as Message[];
};

export const sendMessageToPB = async (
  roomId: string, 
  content: string, 
  role: Role, 
  userId: string,
  color?: string
): Promise<Message> => {
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
        // Expand the user if needed, though realtime events send raw record usually
        // We might need to fetch the user details separately or hope for expand support in newer PB versions
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
  const records = await pb.collection('banned_users').getList(1, 1, {
    filter: `user_id = "${currentUserId}" && target_user_id = "${targetUserId}"`
  });
  
  if (records.items.length > 0) {
    await pb.collection('banned_users').delete(records.items[0].id);
  }
};

export { pb };
