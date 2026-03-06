import { 
  collection, 
  doc, 
  addDoc, 
  getDocs,
  getDoc,
  query, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  where,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { deleteFromFirebaseStorage } from './firebase-storage';
import { roomEventsService } from './room-events';

// Helper function to extract storage path from Supabase URL
const extractStoragePathFromUrl = (url: string): string | null => {
  try {
    // Skip blob URLs (mock storage)
    if (url.startsWith('blob:')) {
      return null;
    }
    
    // Pattern: https://[project].supabase.co/storage/v1/object/public/chat-media/chat-media/filename.png
    // Extract: chat-media/filename.png
    const match = url.match(/\/storage\/v1\/object\/public\/chat-media\/(.+)$/);
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting storage path from URL:', error);
    return null;
  }
};

export interface Room {
  id?: string;
  name: string;
  description: string;
  createdAt: Timestamp | Date;
  createdBy: string; // temporary username
  activeUsers: string[]; // array of temporary usernames
  locked: boolean; // for admin lock
  allowFiles?: boolean; // allow file uploads
  allowLinks?: boolean; // allow links in messages
  allowReactions?: boolean; // allow message reactions (future)
  allowThreads?: boolean; // allow thread replies (future)
}

export interface Message {
  id?: string;
  sender: string; // temporary username
  text: string | null; // required field, but can be null
  mediaUrl: string | null; // required field, but can be null (lowercase 'url' for consistency)
  mediaType: string | null; // required field, but can be null (e.g., 'image/png', 'video/mp4')
  type: 'text' | 'media' | 'mixed'; // required field - message classification
  timestamp: Timestamp | Date;
  flagged: boolean; // default: false
  deleted: boolean; // default: false
  pinned?: boolean; // optional field for pinned messages
}

const ROOMS_COLLECTION = 'rooms';
const MESSAGES_COLLECTION = 'messages';

export const roomService = {
  // Get all rooms
  async getRooms(): Promise<Room[]> {
    try {
      console.log('🔍 Testing Firebase connection - getting rooms...');
      console.log('🔥 Firebase db object:', db);
      console.log('📦 ROOMS_COLLECTION:', ROOMS_COLLECTION);
      
      const q = query(
        collection(db, ROOMS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      console.log('📊 Query created successfully');
      
      const querySnapshot = await getDocs(q);
      console.log('✅ Query executed successfully, got', querySnapshot.docs.length, 'rooms');
      
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Room[];
    } catch (error) {
      console.error('❌ Error getting rooms:', error);
      console.error('🔍 Error code:', error?.code);
      console.error('🔍 Error message:', error?.message);
      throw error;
    }
  },

  // Test Firebase connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Firebase connection...');
      console.log('🔥 DB instance:', db);
      console.log('🏗️ DB app:', db.app);
      console.log('📋 Environment check:', {
        apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      });
      
      // Try to read from the rooms collection specifically
      console.log('🔍 Testing rooms collection access...');
      const roomsRef = collection(db, ROOMS_COLLECTION);
      const roomsQuery = query(roomsRef, limit(1));
      const roomsSnapshot = await getDocs(roomsQuery);
      console.log('✅ Rooms collection accessible, found', roomsSnapshot.docs.length, 'rooms');
      
      return true;
    } catch (error) {
      console.error('❌ Firebase connection test failed:', error);
      console.error('🔍 Error code:', error?.code);
      console.error('🔍 Error message:', error?.message);
      return false;
    }
  },

  /* REMOVED: Auto-room creation functions - no longer auto-creating rooms
  // Create a test room to verify write permissions
  async createTestRoom(): Promise<string | null> {
    try {
      console.log('🧪 Creating test room to verify write permissions...');
      const testRoomData = {
        name: 'General Chat',
        description: 'Welcome to NeonGrid! This is the general chat room for everyone.',
        createdAt: serverTimestamp(),
        createdBy: 'System',
        activeUsers: [],
        locked: false
      };
      
      const docRef = await addDoc(collection(db, ROOMS_COLLECTION), testRoomData);
      console.log('✅ General chat room created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Failed to create test room:', error);
      console.error('🔍 Error code:', error?.code);
      console.error('🔍 Error message:', error?.message);
      return null;
    }
  },

  // Create a welcome message in a room
  async createWelcomeMessage(roomId: string): Promise<void> {
    try {
      console.log('👋 Creating welcome message for room:', roomId);
      await this.sendMessage(roomId, {
        sender: 'System',
        text: 'Welcome to NeonGrid! This room is now ready for chatting. 🚀'
        // Don't include mediaURL and mediaType if they're undefined
      });
      console.log('✅ Welcome message created successfully');
    } catch (error) {
      console.error('❌ Failed to create welcome message:', error);
    }
  },
  */

  // Test message sending function for debugging
  async testMessageSending(roomId: string): Promise<boolean> {
    try {
      console.log('🧪 Testing message sending for room:', roomId);
      
      const testMessage = {
        sender: 'TestUser_' + Math.floor(Math.random() * 1000),
        text: 'Test message sent at ' + new Date().toLocaleTimeString()
        // Don't include mediaURL and mediaType if they're undefined
      };
      
      await this.sendMessage(roomId, testMessage);
      console.log('✅ Test message sent successfully!');
      return true;
    } catch (error) {
      console.error('❌ Test message failed:', error);
      return false;
    }
  },

  // Create a new room
  async createRoom(roomData: Omit<Room, 'id' | 'createdAt' | 'activeUsers' | 'locked'>): Promise<string> {
    try {
      console.log('Firebase db object:', db);
      console.log('Attempting to create room in collection:', ROOMS_COLLECTION);
      
      const newRoomData = {
        ...roomData,
        createdAt: serverTimestamp(),
        activeUsers: [], // Initialize empty array
        locked: false, // Default to unlocked
        allowFiles: true, // Default to allow file uploads
        allowLinks: true, // Default to allow links
        allowReactions: false, // Default to disabled (future feature)
        allowThreads: false // Default to disabled (future feature)
      };
      
      console.log('Room data to be saved:', newRoomData);

      const docRef = await addDoc(collection(db, ROOMS_COLLECTION), newRoomData);

      console.log('Room created successfully, doc ID:', docRef.id);
      
      // Log room creation event
      await roomEventsService.logRoomCreated(docRef.id, roomData.createdBy);
      
      return docRef.id;
    } catch (error) {
      console.error('Detailed Firebase error creating room:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  },

  // Update room settings
  async updateRoom(roomId: string, updates: Partial<Room>): Promise<void> {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      await updateDoc(roomRef, updates);
      console.log('✅ Room updated:', roomId, updates);
    } catch (error) {
      console.error('❌ Error updating room:', error);
      throw error;
    }
  },

  // Clear all messages in a room
  async clearRoomMessages(roomId: string): Promise<void> {
    try {
      console.log('🗑️ Clearing all messages in room:', roomId);
      
      // Step 1: Get all messages
      const messagesRef = collection(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION);
      const messagesSnapshot = await getDocs(messagesRef);
      
      console.log(`📊 Found ${messagesSnapshot.docs.length} messages to delete`);
      
      // Step 2: Delete media files from storage
      const mediaFilesToDelete: string[] = [];
      messagesSnapshot.docs.forEach(messageDoc => {
        const data = messageDoc.data();
        const mediaUrl = data.mediaUrl || data.mediaURL;
        if (mediaUrl && typeof mediaUrl === 'string') {
          const storagePath = extractStoragePathFromUrl(mediaUrl);
          if (storagePath) {
            mediaFilesToDelete.push(storagePath);
          }
        }
      });
      
      if (mediaFilesToDelete.length > 0) {
        console.log(`🗑️ Deleting ${mediaFilesToDelete.length} media files from storage`);
        const storageDeletePromises = mediaFilesToDelete.map(path => 
          deleteFromFirebaseStorage(path).catch(err => {
            console.warn(`⚠️ Failed to delete storage file ${path}:`, err);
            // Continue even if storage deletion fails
          })
        );
        await Promise.all(storageDeletePromises);
        console.log('✅ Media files deleted from storage');
      }
      
      // Step 3: Delete all message documents
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(doc(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION, messageDoc.id))
      );
      
      await Promise.all(deletePromises);
      console.log('✅ All messages cleared from room');
    } catch (error) {
      console.error('❌ Error clearing room messages:', error);
      throw error;
    }
  },

  // Subscribe to room updates
  subscribeToRooms(callback: (rooms: Room[]) => void) {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const q = query(roomsRef, orderBy('lastActivity', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Room));
      callback(rooms);
    });
  },

  // Get messages for a specific room
  async getMessages(roomId: string): Promise<Message[]> {
    try {
      const messagesRef = collection(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION);
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Subscribe to real-time messages
  subscribeToMessages(roomId: string, callback: (messages: Message[]) => void) {
    const messagesRef = collection(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      console.log(`🔊 Firestore snapshot received for room ${roomId}:`, snapshot.docs.length, 'docs');
      const messages = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        
        // Normalize field names (handle both mediaURL and mediaUrl)
        const mediaUrl = data.mediaUrl || data.mediaURL || null;
        const text = data.text ?? null;
        const mediaType = data.mediaType ?? null;
        
        console.log(`  📄 Doc ${index} (${doc.id}):`, {
          sender: data.sender,
          type: data.type,
          hasText: !!text,
          text: text?.substring(0, 30),
          hasMediaUrl: !!mediaUrl,
          mediaUrl: mediaUrl,
          mediaType: mediaType,
          pinned: data.pinned,
          allFields: Object.keys(data)
        });
        
        // Classify message type
        const hasText = !!(text && text.trim());
        const hasMedia = !!(mediaUrl && mediaUrl.trim());
        
        let type: 'text' | 'media' | 'mixed';
        if (hasText && hasMedia) {
          type = 'mixed';
        } else if (hasMedia) {
          type = 'media';
        } else {
          type = 'text';
        }
        
        const message: Message = {
          id: doc.id,
          sender: data.sender,
          text: text,
          mediaUrl: mediaUrl,
          mediaType: mediaType,
          type: type,
          timestamp: data.timestamp,
          flagged: data.flagged ?? false,
          deleted: data.deleted ?? false,
          pinned: data.pinned ?? false
        };
        
        return message;
      });
      console.log(`➡️ Calling callback with ${messages.length} messages`);
      callback(messages);
    });
  },

  // Send a message
  async sendMessage(roomId: string, messageData: Omit<Message, 'id' | 'timestamp' | 'flagged' | 'deleted'>): Promise<void> {
    try {
      console.log("💬 Sending message to room:", roomId, "Data:", messageData);

      // Verify room exists by checking document
      const roomDocRef = doc(db, ROOMS_COLLECTION, roomId);
      const roomDoc = await getDoc(roomDocRef);
      if (!roomDoc.exists()) {
        throw new Error(`Room ${roomId} does not exist`);
      }

      // Validate message has at least text or media
      const hasText = !!(messageData.text && messageData.text.trim());
      const hasMedia = !!(messageData.mediaUrl && messageData.mediaUrl.trim());
      
      if (!hasText && !hasMedia) {
        throw new Error('Message must have either text or media');
      }

      const messagesRef = collection(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION);

      // Ensure consistent data structure
      const finalMessageData = {
        sender: messageData.sender,
        text: messageData.text ?? null,
        mediaUrl: messageData.mediaUrl ?? null,
        mediaType: messageData.mediaType ?? null,
        type: messageData.type,
        timestamp: serverTimestamp(),
        flagged: false,
        deleted: false
      };

      console.log("💬 Final message data being stored:", finalMessageData);
      console.log("📊 Message classification:", {
        hasText,
        hasMedia,
        type: finalMessageData.type
      });

      const docRef = await addDoc(messagesRef, finalMessageData);
      console.log("✅ Message stored with ID:", docRef.id);
      
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Admin functions
  async deleteRoom(roomId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting room and all its contents:', roomId);
      
      // Step 1: Get all messages to find media files
      const messagesRef = collection(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION);
      const messagesSnapshot = await getDocs(messagesRef);
      
      console.log(`📊 Found ${messagesSnapshot.docs.length} messages to delete`);
      
      // Step 2: Delete media files from storage
      const mediaFilesToDelete: string[] = [];
      messagesSnapshot.docs.forEach(messageDoc => {
        const data = messageDoc.data();
        const mediaUrl = data.mediaUrl || data.mediaURL;
        if (mediaUrl && typeof mediaUrl === 'string') {
          const storagePath = extractStoragePathFromUrl(mediaUrl);
          if (storagePath) {
            mediaFilesToDelete.push(storagePath);
          }
        }
      });
      
      if (mediaFilesToDelete.length > 0) {
        console.log(`🗑️ Deleting ${mediaFilesToDelete.length} media files from storage`);
        const storageDeletePromises = mediaFilesToDelete.map(path => 
          deleteFromFirebaseStorage(path).catch(err => {
            console.warn(`⚠️ Failed to delete storage file ${path}:`, err);
            // Continue even if storage deletion fails
          })
        );
        await Promise.all(storageDeletePromises);
        console.log('✅ Media files deleted from storage');
      }
      
      // Step 3: Delete all message documents
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(doc(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION, messageDoc.id))
      );
      
      await Promise.all(deletePromises);
      console.log('✅ All messages deleted');
      
      // Step 4: Delete the room document itself
      await deleteDoc(doc(db, ROOMS_COLLECTION, roomId));
      console.log('✅ Room document deleted');
      
      console.log('✅ Room and all contents successfully deleted');
    } catch (error) {
      console.error('❌ Error deleting room:', error);
      throw error;
    }
  },

  async deleteMessage(roomId: string, messageId: string): Promise<void> {
    try {
      // Step 1: Get the message to check for media files
      const messageRef = doc(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION, messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        const data = messageDoc.data();
        const mediaUrl = data.mediaUrl || data.mediaURL;
        
        // Step 2: Delete media file from storage if it exists
        if (mediaUrl && typeof mediaUrl === 'string') {
          const storagePath = extractStoragePathFromUrl(mediaUrl);
          if (storagePath) {
            console.log('🗑️ Deleting media file from storage:', storagePath);
            try {
              await deleteFromFirebaseStorage(storagePath);
              console.log('✅ Media file deleted from storage');
            } catch (storageError) {
              console.warn('⚠️ Failed to delete media file from storage:', storageError);
              // Continue with message deletion even if storage deletion fails
            }
          }
        }
      }
      
      // Step 3: Delete the message document
      await deleteDoc(messageRef);
      console.log('✅ Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  async flagMessage(roomId: string, messageId: string, flagged: boolean = true): Promise<void> {
    try {
      const messageRef = doc(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION, messageId);
      await updateDoc(messageRef, { flagged });
    } catch (error) {
      console.error('Error flagging message:', error);
      throw error;
    }
  },

  async togglePinMessage(roomId: string, messageId: string, pinned: boolean): Promise<void> {
    try {
      console.log('📌 Toggling pin message:', { roomId, messageId, pinned });
      
      if (!roomId || !messageId) {
        throw new Error('Missing roomId or messageId');
      }
      
      const messageRef = doc(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION, messageId);
      
      console.log('📌 Message reference created:', messageRef.path);
      
      await updateDoc(messageRef, { pinned });
      
      console.log(`✅ Message ${pinned ? 'pinned' : 'unpinned'} successfully`);
    } catch (error) {
      console.error('❌ Error toggling pin message:', error);
      console.error('❌ Error details:', {
        message: (error as Error).message,
        code: (error as any).code,
        roomId,
        messageId,
        pinned
      });
      throw error;
    }
  },

  // Get a single room by ID
  async getRoom(roomId: string): Promise<Room | null> {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) return null;
      return { id: roomSnap.id, ...roomSnap.data() } as Room;
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    }
  },

  // User tracking functions
  async joinRoom(roomId: string, username: string): Promise<void> {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const roomData = roomSnap.data() as Room;
        const activeUsers = roomData.activeUsers || [];
        if (!activeUsers.includes(username)) {
          await updateDoc(roomRef, { activeUsers: [...activeUsers, username] });
        }
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  },

  async leaveRoom(roomId: string, username: string): Promise<void> {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const roomData = roomSnap.data() as Room;
        const activeUsers = roomData.activeUsers || [];
        await updateDoc(roomRef, {
          activeUsers: activeUsers.filter(u => u !== username)
        });
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  },

  // Admin functions for room management
  async lockRoom(roomId: string, locked: boolean = true): Promise<void> {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      await updateDoc(roomRef, { locked });
    } catch (error) {
      console.error('Error locking/unlocking room:', error);
      throw error;
    }
  },

  // Get media gallery (messages with media)
  async getMediaMessages(roomId: string): Promise<Message[]> {
    try {
      const messagesRef = collection(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION);
      // Get all messages without any index requirements, then filter in JavaScript
      const snapshot = await getDocs(messagesRef);
      
      console.log(`📊 getMediaMessages for room ${roomId}: found ${snapshot.docs.length} total messages`);
      
      // Filter for non-deleted messages with media URLs and sort by timestamp
      const mediaMessages = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            sender: data.sender,
            text: data.text ?? null,
            mediaUrl: data.mediaUrl ?? null,
            mediaType: data.mediaType ?? null,
            type: data.type ?? 'media',
            timestamp: data.timestamp,
            flagged: data.flagged ?? false,
            deleted: data.deleted ?? false
          } as Message;
        })
        .filter(msg => {
          const hasMedia = !!(msg.mediaUrl && msg.mediaUrl.trim() !== '');
          const notDeleted = !msg.deleted;
          return hasMedia && notDeleted;
        })
        .sort((a, b) => {
          const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : a.timestamp.toMillis();
          const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : b.timestamp.toMillis();
          return bTime - aTime; // Descending order (newest first)
        });
      
      console.log(`📊 getMediaMessages for room ${roomId}: filtered to ${mediaMessages.length} media messages`);
      return mediaMessages;
    } catch (error) {
      console.error('Error getting media messages:', error);
      throw error;
    }
  }
};
