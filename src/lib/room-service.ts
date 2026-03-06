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

export interface Room {
  id?: string;
  name: string;
  description: string;
  createdAt: Timestamp | Date;
  createdBy: string; // temporary username
  activeUsers: string[]; // array of temporary usernames
  locked: boolean; // for admin lock
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
        locked: false // Default to unlocked
      };
      
      console.log('Room data to be saved:', newRoomData);

      const docRef = await addDoc(collection(db, ROOMS_COLLECTION), newRoomData);

      console.log('Room created successfully, doc ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Detailed Firebase error creating room:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
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
          deleted: data.deleted ?? false
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
      await deleteDoc(doc(db, ROOMS_COLLECTION, roomId));
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  async deleteMessage(roomId: string, messageId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION, messageId));
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

  // User tracking functions
  async joinRoom(roomId: string, username: string): Promise<void> {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      const roomSnap = await getDocs(query(collection(db, ROOMS_COLLECTION), where('__name__', '==', roomId)));
      
      if (!roomSnap.empty) {
        const roomData = roomSnap.docs[0].data() as Room;
        const activeUsers = roomData.activeUsers || [];
        
        if (!activeUsers.includes(username)) {
          await updateDoc(roomRef, {
            activeUsers: [...activeUsers, username]
          });
        }
      }
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  },

  async leaveRoom(roomId: string, username: string): Promise<void> {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      const roomSnap = await getDocs(query(collection(db, ROOMS_COLLECTION), where('__name__', '==', roomId)));
      
      if (!roomSnap.empty) {
        const roomData = roomSnap.docs[0].data() as Room;
        const activeUsers = roomData.activeUsers || [];
        
        await updateDoc(roomRef, {
          activeUsers: activeUsers.filter(user => user !== username)
        });
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
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
      const mediaQuery = query(
        messagesRef, 
        where('mediaUrl', '!=', null),
        where('deleted', '==', false),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(mediaQuery);
      return snapshot.docs.map(doc => {
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
      });
    } catch (error) {
      console.error('Error getting media messages:', error);
      throw error;
    }
  }
};
