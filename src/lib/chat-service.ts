import { collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
  id?: string;
  text: string | null;
  userId: string;
  username: string;
  createdAt: Timestamp;
  mediaUrl: string | null;
  mediaType: string | null;
  type: 'text' | 'media' | 'mixed';
}

const MESSAGES_COLLECTION = 'messages';

export const chatService = {
  // Send a new message
  async sendMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>) {
    try {
      const hasText = !!(message.text && message.text.trim());
      const hasMedia = !!(message.mediaUrl && message.mediaUrl.trim());
      
      if (!hasText && !hasMedia) {
        throw new Error('Message must have either text or media');
      }
      
      await addDoc(collection(db, MESSAGES_COLLECTION), {
        ...message,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Subscribe to messages with realtime updates
  subscribeToMessages(callback: (messages: ChatMessage[]) => void, messageLimit = 50) {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(messageLimit)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      
      callback(messages.reverse());
    });
  },
};