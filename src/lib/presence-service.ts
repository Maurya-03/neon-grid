import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { roomEventsService } from './room-events';

export interface UserPresence {
  userId: string;
  roomId: string;
  username: string;
  lastActive: Timestamp | Date;
  status: 'online' | 'offline';
}

const PRESENCE_COLLECTION = 'presence';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export class PresenceService {
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private unsubscribePresence: (() => void) | null = null;
  private currentUsername: string | null = null; // Store username for cleanup

  // Join a room and mark user as online
  async joinRoom(userId: string, roomId: string, username: string): Promise<void> {
    try {
      console.log('🔵 Starting joinRoom:', { userId, roomId, username });
      
      const presenceRef = doc(db, PRESENCE_COLLECTION, `${userId}_${roomId}`);
      
      const presenceData = {
        userId,
        roomId,
        username,
        lastActive: serverTimestamp(),
        status: 'online',
      };
      
      console.log('🔵 Setting presence document:', presenceData);
      
      await setDoc(presenceRef, presenceData);

      console.log('✅ User joined room presence:', { userId, roomId, username });

      // Store username for later use
      this.currentUsername = username;

      // Log user joined event
      try {
        await roomEventsService.logUserJoined(roomId, username);
      } catch (eventError) {
        console.warn('⚠️ Failed to log user joined event:', eventError);
      }

      // Start heartbeat
      this.startHeartbeat(userId, roomId, username);

      // Handle page unload
      this.setupUnloadHandler(userId, roomId);
    } catch (error) {
      console.error('❌ Error joining room presence:', error);
      console.error('❌ Error details:', {
        message: (error as Error).message,
        code: (error as any).code,
        userId,
        roomId,
        username
      });
      throw error;
    }
  }

  // Leave a room and mark user as offline
  async leaveRoom(userId: string, roomId: string): Promise<void> {
    try {
      this.stopHeartbeat();

      const presenceRef = doc(db, PRESENCE_COLLECTION, `${userId}_${roomId}`);
      
      // Update status to offline instead of deleting
      await setDoc(
        presenceRef,
        {
          status: 'offline',
          lastActive: serverTimestamp(),
        },
        { merge: true }
      );

      console.log('✅ User left room presence:', { userId, roomId });

      // Log user left event (if we have the username)
      if (this.currentUsername) {
        await roomEventsService.logUserLeft(roomId, this.currentUsername);
        this.currentUsername = null;
      }
    } catch (error) {
      console.error('❌ Error leaving room presence:', error);
    }
  }

  // Start heartbeat to keep presence alive
  private startHeartbeat(userId: string, roomId: string, username: string): void {
    this.stopHeartbeat(); // Clear any existing heartbeat

    this.heartbeatInterval = setInterval(async () => {
      try {
        const presenceRef = doc(db, PRESENCE_COLLECTION, `${userId}_${roomId}`);
        
        await setDoc(
          presenceRef,
          {
            lastActive: serverTimestamp(),
            status: 'online',
          },
          { merge: true }
        );

        console.log('💓 Heartbeat sent:', { userId, roomId });
      } catch (error) {
        console.error('❌ Error sending heartbeat:', error);
      }
    }, HEARTBEAT_INTERVAL);
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Setup handler for page unload
  private setupUnloadHandler(userId: string, roomId: string): void {
    const handleUnload = async () => {
      await this.leaveRoom(userId, roomId);
    };

    window.addEventListener('beforeunload', handleUnload);
    
    // Store reference to remove later if needed
    (window as any).__presenceUnloadHandler = handleUnload;
  }

  // Subscribe to active members in a room
  subscribeToActiveMembers(
    roomId: string,
    callback: (members: UserPresence[]) => void
  ): () => void {
    try {
      console.log('🔍 Subscribing to active members for room:', roomId);
      
      const presenceRef = collection(db, PRESENCE_COLLECTION);
      const q = query(
        presenceRef,
        where('roomId', '==', roomId),
        where('status', '==', 'online')
      );

      const unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          const members: UserPresence[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              userId: data.userId,
              roomId: data.roomId,
              username: data.username,
              lastActive: data.lastActive,
              status: data.status,
            } as UserPresence;
          });

          console.log('👥 Active members updated:', {
            roomId,
            count: members.length,
            members: members.map(m => m.username)
          });
          callback(members);
        },
        (error) => {
          console.error('❌ Error in presence subscription:', error);
          console.error('❌ Error details:', {
            message: error.message,
            code: (error as any).code,
            roomId
          });
        }
      );

      this.unsubscribePresence = unsubscribe;
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to active members:', error);
      return () => {};
    }
  }

  // Cleanup
  cleanup(userId: string, roomId: string): void {
    this.stopHeartbeat();
    
    if (this.unsubscribePresence) {
      this.unsubscribePresence();
      this.unsubscribePresence = null;
    }

    // Async cleanup (don't await)
    this.leaveRoom(userId, roomId);
  }
}

export const presenceService = new PresenceService();
