import { collection, addDoc, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export type RoomEventType =
  | 'user_joined'
  | 'user_left'
  | 'message_deleted'
  | 'message_pinned'
  | 'room_locked'
  | 'room_unlocked'
  | 'file_uploaded'
  | 'message_flagged'
  | 'room_created';

export interface RoomEvent {
  id?: string;
  roomId: string;
  type: RoomEventType;
  user: string; // username who performed the action
  target?: string; // optional: message ID, file name, user name, etc.
  metadata?: Record<string, any>; // optional: additional data
  timestamp: Timestamp | Date;
}

const ROOM_EVENTS_COLLECTION = 'room_events';

export const roomEventsService = {
  /**
   * Create a new room event
   */
  async createEvent(event: Omit<RoomEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, ROOM_EVENTS_COLLECTION), {
        ...event,
        timestamp: Timestamp.now(),
      });
      console.log('✅ Room event created:', event.type);
    } catch (error) {
      console.error('❌ Failed to create room event:', error);
      // Don't throw - logging is non-critical
    }
  },

  /**
   * Subscribe to room events with real-time updates
   */
  subscribeToRoomEvents(
    roomId: string,
    callback: (events: RoomEvent[]) => void,
    eventLimit = 50
  ): () => void {
    try {
      const q = query(
        collection(db, ROOM_EVENTS_COLLECTION),
        where('roomId', '==', roomId),
        orderBy('timestamp', 'desc'),
        limit(eventLimit)
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const events = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as RoomEvent[];

          callback(events);
        },
        (error) => {
          console.error('❌ Error subscribing to room events:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('❌ Failed to subscribe to room events:', error);
      return () => {}; // Return empty unsubscribe function
    }
  },

  /**
   * Helper to log user joined event
   */
  async logUserJoined(roomId: string, username: string): Promise<void> {
    await this.createEvent({
      roomId,
      type: 'user_joined',
      user: username,
    });
  },

  /**
   * Helper to log user left event
   */
  async logUserLeft(roomId: string, username: string): Promise<void> {
    await this.createEvent({
      roomId,
      type: 'user_left',
      user: username,
    });
  },

  /**
   * Helper to log file uploaded event
   */
  async logFileUploaded(roomId: string, username: string, fileName: string, fileSize?: number): Promise<void> {
    await this.createEvent({
      roomId,
      type: 'file_uploaded',
      user: username,
      target: fileName,
      metadata: fileSize ? { fileSize } : undefined,
    });
  },

  /**
   * Helper to log message deleted event
   */
  async logMessageDeleted(roomId: string, username: string, messageId?: string): Promise<void> {
    await this.createEvent({
      roomId,
      type: 'message_deleted',
      user: username,
      target: messageId,
    });
  },

  /**
   * Helper to log message pinned event
   */
  async logMessagePinned(roomId: string, username: string, messageId?: string): Promise<void> {
    await this.createEvent({
      roomId,
      type: 'message_pinned',
      user: username,
      target: messageId,
    });
  },

  /**
   * Helper to log room locked event
   */
  async logRoomLocked(roomId: string, username: string): Promise<void> {
    await this.createEvent({
      roomId,
      type: 'room_locked',
      user: username,
    });
  },

  /**
   * Helper to log room unlocked event
   */
  async logRoomUnlocked(roomId: string, username: string): Promise<void> {
    await this.createEvent({
      roomId,
      type: 'room_unlocked',
      user: username,
    });
  },

  /**
   * Helper to log message flagged event
   */
  async logMessageFlagged(roomId: string, username: string, messageId?: string): Promise<void> {
    await this.createEvent({
      roomId,
      type: 'message_flagged',
      user: username,
      target: messageId,
    });
  },

  /**
   * Helper to log room created event
   */
  async logRoomCreated(roomId: string, username: string): Promise<void> {
    await this.createEvent({
      roomId,
      type: 'room_created',
      user: username,
    });
  },
};
