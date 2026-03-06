// Direct Firebase test - bypasses all UI components
import { collection, addDoc, getDocs, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

const ROOMS_COLLECTION = 'rooms';
const MESSAGES_COLLECTION = 'messages';

export const directFirebaseTest = {
  // Test 1: Direct room creation
  async createTestRoom() {
    try {
      console.log('🧪 [DIRECT TEST] Creating room directly...');
      
      const roomData = {
        name: 'Direct Test Room',
        description: 'Room created directly via Firebase',
        createdAt: serverTimestamp(),
        createdBy: 'DirectTest',
        activeUsers: [],
        locked: false
      };
      
      const docRef = await addDoc(collection(db, ROOMS_COLLECTION), roomData);
      console.log('✅ [DIRECT TEST] Room created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ [DIRECT TEST] Room creation failed:', error);
      return null;
    }
  },

  // Test 2: Direct message sending
  async sendTestMessage(roomId: string) {
    try {
      console.log('🧪 [DIRECT TEST] Sending message directly...');
      
      const messageData = {
        sender: 'DirectTestUser',
        text: 'Direct test message at ' + new Date().toISOString(),
        timestamp: serverTimestamp(),
        flagged: false,
        deleted: false
        // Don't include mediaURL and mediaType if they're undefined
      };
      
      const messagesRef = collection(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION);
      const docRef = await addDoc(messagesRef, messageData);
      console.log('✅ [DIRECT TEST] Message sent with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ [DIRECT TEST] Message sending failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return null;
    }
  },

  // Test 3: Direct message reading
  async readMessages(roomId: string) {
    try {
      console.log('🧪 [DIRECT TEST] Reading messages directly...');
      
      const messagesRef = collection(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION);
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);
      
      console.log('✅ [DIRECT TEST] Found', snapshot.docs.length, 'messages');
      snapshot.docs.forEach((doc, index) => {
        console.log(`Message ${index + 1}:`, doc.data());
      });
      
      return snapshot.docs.length;
    } catch (error) {
      console.error('❌ [DIRECT TEST] Message reading failed:', error);
      return 0;
    }
  },

  // Test 4: Real-time subscription
  subscribeToMessages(roomId: string) {
    try {
      console.log('🧪 [DIRECT TEST] Setting up real-time subscription...');
      
      const messagesRef = collection(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION);
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('📡 [DIRECT TEST] Real-time update:', snapshot.docs.length, 'messages');
        snapshot.docs.forEach((doc) => {
          console.log('Message:', doc.data());
        });
      });
      
      console.log('✅ [DIRECT TEST] Subscription active');
      return unsubscribe;
    } catch (error) {
      console.error('❌ [DIRECT TEST] Subscription failed:', error);
      return () => {};
    }
  },

  // Complete test flow
  async runFullTest() {
    console.log('🚀 [DIRECT TEST] Starting full Firebase test...');
    
    try {
      // Step 1: Create room
      const roomId = await this.createTestRoom();
      if (!roomId) {
        console.error('❌ [DIRECT TEST] Cannot proceed - room creation failed');
        return false;
      }
      
      // Step 2: Set up subscription
      const unsubscribe = this.subscribeToMessages(roomId);
      
      // Step 3: Send message
      const messageId = await this.sendTestMessage(roomId);
      if (!messageId) {
        console.error('❌ [DIRECT TEST] Message sending failed');
        unsubscribe();
        return false;
      }
      
      // Step 4: Read messages
      setTimeout(async () => {
        await this.readMessages(roomId);
        unsubscribe();
        console.log('✅ [DIRECT TEST] Full test completed successfully!');
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('❌ [DIRECT TEST] Full test failed:', error);
      return false;
    }
  }
};

// Expose for console testing
(window as any).directFirebaseTest = directFirebaseTest;